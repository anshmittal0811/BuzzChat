import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
  ) {
    // Validate Cloudinary configuration
    this.validateCloudinaryConfig();
    
    // Ensure temp directory exists on service initialization
    this.ensureTempDirectoryExists();
  }

  private tempDir = path.resolve(__dirname, '../../temp_chunks');

  /**
   * Validates the Cloudinary configuration
   */
  private validateCloudinaryConfig() {
    try {
      const config = this.cloudinaryInstance.config();
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        this.logger.error('Cloudinary configuration is incomplete');
        this.logger.error(`Cloud name: ${config.cloud_name ? 'SET' : 'MISSING'}`);
        this.logger.error(`API key: ${config.api_key ? 'SET' : 'MISSING'}`);
        this.logger.error(`API secret: ${config.api_secret ? 'SET' : 'MISSING'}`);
        throw new Error('Cloudinary configuration is incomplete');
      }
      this.logger.log(`Cloudinary configured for cloud: ${config.cloud_name}`);
    } catch (error) {
      this.logger.error(`Cloudinary configuration validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensures the temporary directory exists, creates it if it doesn't
   */
  private ensureTempDirectoryExists() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
        this.logger.log(`Created temp directory: ${this.tempDir}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${error.message}`);
      throw new Error(`Unable to create temporary directory: ${error.message}`);
    }
  }

  async storeChunk(
    chunk: Express.Multer.File,
    body: {
      fileId: string;
      chunkIndex: string;
      totalChunks: string;
      fileName: string;
      mimeType: string;
    },
  ) {
    try {
      this.logger.debug(`Storing chunk ${body.chunkIndex} for file ${body.fileId}`);
      
      const fileDir = path.join(this.tempDir, body.fileId);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      const chunkPath = path.join(fileDir, `chunk_${body.chunkIndex}`);
      fs.writeFileSync(chunkPath, chunk.buffer);
      
      this.logger.debug(`Successfully stored chunk ${body.chunkIndex} for file ${body.fileId}`);
    } catch (error) {
      this.logger.error(`Failed to store chunk: ${error.message}`);
      throw new Error(`Unable to store file chunk: ${error.message}`);
    }
  }

  async finalizeUpload(fileId: string, fileName: string) {
    try {
      this.logger.log(`Starting finalization for file ${fileId}: ${fileName}`);
      
      const fileDir = path.join(this.tempDir, fileId);
      
      // Check if file directory exists
      if (!fs.existsSync(fileDir)) {
        this.logger.error(`File directory not found: ${fileDir}`);
        throw new Error(`File chunks not found for fileId: ${fileId}`);
      }

      // Read and sort chunk files
      const chunkFiles = fs.readdirSync(fileDir).sort((a, b) => {
        const indexA = parseInt(a.split('_')[1], 10);
        const indexB = parseInt(b.split('_')[1], 10);
        return indexA - indexB;
      });

      if (chunkFiles.length === 0) {
        this.logger.error(`No chunk files found in directory: ${fileDir}`);
        throw new Error(`No file chunks found for fileId: ${fileId}`);
      }

      this.logger.debug(`Found ${chunkFiles.length} chunks for file ${fileId}`);

      // Combine chunks into final file
      const finalPath = path.join(this.tempDir, `${fileId}_full`);
      const writeStream = fs.createWriteStream(finalPath);

      for (const chunkFile of chunkFiles) {
        const chunkPath = path.join(fileDir, chunkFile);
        if (!fs.existsSync(chunkPath)) {
          this.logger.error(`Chunk file missing: ${chunkPath}`);
          throw new Error(`Missing chunk file: ${chunkFile}`);
        }
        const chunk = fs.readFileSync(chunkPath);
        writeStream.write(chunk);
      }
      writeStream.end();

      // Wait for file write to complete
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (error) => reject(error));
      });

      this.logger.debug(`Successfully combined chunks for file ${fileId}`);

      // Read the final file and upload to Cloudinary
      const buffer = fs.readFileSync(finalPath);
      this.logger.log(`Uploading file ${fileName} to Cloudinary (${buffer.length} bytes)`);
      
      const result = await this.uploadToCloudinary(buffer, fileName);
      this.logger.log(`Successfully uploaded ${fileName} to Cloudinary: ${result.secure_url}`);

      // Cleanup temporary files
      try {
        fs.rmSync(fileDir, { recursive: true, force: true });
        fs.unlinkSync(finalPath);
        this.logger.debug(`Cleaned up temporary files for ${fileId}`);
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup temporary files: ${cleanupError.message}`);
        // Don't throw error for cleanup failures
      }

      return {
        url: result.secure_url,
        name: `${Date.now()}${path.extname(result?.display_name || fileName)}`,
        type: result.format ?? result?.resource_type,
        size: result.bytes,
      };
    } catch (error) {
      this.logger.error(`Failed to finalize upload for ${fileId}: ${error.message}`);
      
      // Attempt cleanup on error
      try {
        const fileDir = path.join(this.tempDir, fileId);
        const finalPath = path.join(this.tempDir, `${fileId}_full`);
        
        if (fs.existsSync(fileDir)) {
          fs.rmSync(fileDir, { recursive: true, force: true });
        }
        if (fs.existsSync(finalPath)) {
          fs.unlinkSync(finalPath);
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup after error: ${cleanupError.message}`);
      }
      
      throw error;
    }
  }

  private async uploadToCloudinary(buffer: Buffer, fileName: string): Promise<UploadApiResponse> {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Cloudinary upload attempt ${attempt}/${maxRetries} for ${fileName} (${buffer.length} bytes)`);
        
        const result = await this.attemptCloudinaryUpload(buffer, fileName, attempt);
        this.logger.log(`Cloudinary upload successful on attempt ${attempt}: ${result.secure_url}`);
        return result;
      } catch (error) {
        this.logger.warn(`Cloudinary upload attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} Cloudinary upload attempts failed for ${fileName}`);
          throw new Error(`Cloudinary upload failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        this.logger.debug(`Waiting ${delay}ms before retry attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private attemptCloudinaryUpload(buffer: Buffer, fileName: string, attempt: number): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Increase timeout for larger files
        const baseTimeout = 60000; // 60 seconds base
        const sizeMultiplier = Math.max(1, buffer.length / (1024 * 1024)); // 1 second per MB
        const uploadTimeout = Math.min(baseTimeout * sizeMultiplier, 300000); // Max 5 minutes
        
        this.logger.debug(`Upload timeout set to ${uploadTimeout}ms for ${fileName} (attempt ${attempt})`);

        const timeoutHandle = setTimeout(() => {
          this.logger.error(`Cloudinary upload timeout after ${uploadTimeout}ms for ${fileName}`);
          reject(new Error(`Upload timeout: Cloudinary upload took longer than ${uploadTimeout}ms`));
        }, uploadTimeout);

        const uploadOptions = {
          resource_type: 'auto' as const,
          display_name: fileName,
          timeout: uploadTimeout,
          // Add chunk size for large files
          chunk_size: buffer.length > 10 * 1024 * 1024 ? 10 * 1024 * 1024 : undefined, // 10MB chunks for files > 10MB
          // Add quality optimization for images
          quality: 'auto:good',
          fetch_format: 'auto',
        };

        const stream = this.cloudinaryInstance.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            clearTimeout(timeoutHandle);
            
            if (error) {
              this.logger.error(`Cloudinary upload error (attempt ${attempt}): ${error.message}`);
              // Check for specific error types that shouldn't be retried
              if (error.message.includes('Invalid image file') || 
                  error.message.includes('File size too large') ||
                  error.message.includes('Invalid api_key')) {
                reject(new Error(`Non-retryable error: ${error.message}`));
              } else {
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              }
            } else if (result) {
              this.logger.debug(`Cloudinary upload successful (attempt ${attempt}): ${result.secure_url}`);
              resolve(result);
            } else {
              this.logger.error(`Cloudinary upload returned no result (attempt ${attempt})`);
              reject(new Error('Cloudinary upload failed: No result returned'));
            }
          },
        );

        // Handle stream errors
        stream.on('error', (streamError) => {
          clearTimeout(timeoutHandle);
          this.logger.error(`Cloudinary stream error (attempt ${attempt}): ${streamError.message}`);
          reject(new Error(`Upload stream error: ${streamError.message}`));
        });

        // Handle stream timeout specifically
        stream.on('timeout', () => {
          clearTimeout(timeoutHandle);
          this.logger.error(`Cloudinary stream timeout (attempt ${attempt})`);
          reject(new Error('Upload stream timeout'));
        });

        // Create a readable stream with error handling
        const readableStream = Readable.from(buffer);
        readableStream.on('error', (streamError) => {
          clearTimeout(timeoutHandle);
          this.logger.error(`Input stream error (attempt ${attempt}): ${streamError.message}`);
          reject(new Error(`Input stream error: ${streamError.message}`));
        });

        // Pipe with error handling
        readableStream.pipe(stream);
      } catch (error) {
        this.logger.error(`Cloudinary upload setup error (attempt ${attempt}): ${error.message}`);
        reject(new Error(`Upload setup failed: ${error.message}`));
      }
    });
  }
}

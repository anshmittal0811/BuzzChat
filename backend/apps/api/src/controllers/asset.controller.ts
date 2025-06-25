import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetService } from '@app/shared/services/asset.service';
import { Express } from 'express';

@Controller('assets')
export class AssetController {
  private readonly logger = new Logger(AssetController.name);

  constructor(private assetService: AssetService) {}

  @Get('health')
  async healthCheck() {
    // Test Cloudinary connectivity
    const cloudinaryStatus = process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured';
    
    return {
      status: 'ok',
      service: 'asset-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      cloudinary: cloudinaryStatus,
      environment: {
        node_env: process.env.NODE_ENV,
        has_cloudinary_cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        has_cloudinary_api_key: !!process.env.CLOUDINARY_API_KEY,
        has_cloudinary_api_secret: !!process.env.CLOUDINARY_API_SECRET,
      }
    };
  }

  @Post('upload-chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      this.logger.log(`Uploading chunk ${body.chunkIndex}/${body.totalChunks} for file ${body.fileId}`);
      await this.assetService.storeChunk(file, body);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Chunk upload failed: ${error.message}`);
      throw new HttpException(
        `Chunk upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete-upload')
  async completeUpload(@Body() body: { fileId: string, fileName: string }) {
    try {
      this.logger.log(`Completing upload for file ${body.fileId}: ${body.fileName}`);
      
      if (!body.fileId || !body.fileName) {
        throw new HttpException(
          'Missing required fields: fileId and fileName are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.assetService.finalizeUpload(body.fileId, body.fileName);
      this.logger.log(`Upload completed successfully for ${body.fileName}: ${result.url}`);
      return result;
    } catch (error) {
      this.logger.error(`Upload completion failed: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Upload completion failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 
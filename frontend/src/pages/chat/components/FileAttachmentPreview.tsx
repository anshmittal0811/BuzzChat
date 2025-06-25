import React from "react";
import { Progress } from "@/components/ui/progress";
import { SvgIcons } from "@/components/SvgIcons";
import extensionToIconMap from "@/constants/fileIconMap";

/**
 * Props for FileAttachmentPreview component
 */
interface FileAttachmentPreviewProps {
  /** The file being uploaded */
  file: File;
  /** File extension for icon display */
  extension: string | null;
  /** Upload URL when complete */
  url: string | null;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Error message if upload failed */
  error?: string | null;
  /** Callback when remove button is clicked */
  onRemove: () => void;
  /** Callback to retry upload */
  onRetry?: () => void;
}

/**
 * FileAttachmentPreview Component
 * 
 * Displays a preview of the file being uploaded with progress indicator,
 * success/error states, and removal functionality.
 * 
 * @param props - Component props
 * @returns JSX element for file attachment preview
 */
export const FileAttachmentPreview: React.FC<FileAttachmentPreviewProps> = ({
  file,
  extension,
  url,
  progress,
  isUploading = false,
  error = null,
  onRemove,
  onRetry,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = () => {
    if (error) return <SvgIcons.CloseIcon />;
    if (url && !isUploading) return <SvgIcons.CheckIcon />;
    if (isUploading) return <SvgIcons.LoadingSpinner />;
    return null;
  };

  const getStatusText = () => {
    if (error) return "Upload failed";
    if (url && !isUploading) return "Upload complete";
    if (isUploading) return "Uploading...";
    return "Ready to upload";
  };

  return (
    <div className="relative flex flex-col p-5 gap-4 shadow-[0_-3px_5px_0_rgba(255,255,255,0.3)] rounded-t-2xl bg-secondary/10 backdrop-blur-sm">
      {/* File Info Row */}
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {extension && extensionToIconMap?.[extension] ? (
              extensionToIconMap[extension]()
            ) : (
              <div className="w-6 h-6 bg-gray-400 rounded" />
            )}
          </div>
          
          {/* File Details */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-white font-medium truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-gray-400 text-sm">
              {formatFileSize(file.size)}
            </span>
          </div>
          
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>
        
        {/* Remove Button */}
                 <button
           className="flex justify-center items-center w-8 h-8 ml-3 hover:bg-gray-600 rounded-full transition-colors"
           onClick={onRemove}
           aria-label="Remove attachment"
           type="button"
         >
           <SvgIcons.CloseIcon />
         </button>
      </div>

      {/* Progress Bar */}
      {isUploading && !error && (
        <div className="flex flex-col gap-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{getStatusText()}</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-400">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
                type="button"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {url && !isUploading && !error && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400">{getStatusText()}</span>
        </div>
      )}
    </div>
  );
}; 
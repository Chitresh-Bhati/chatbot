import { useState, useRef } from "react";
import { Paperclip, X, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileAttachment } from "@shared/schema";

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  selectedFiles: FileAttachment[];
  isUploading?: boolean;
  "data-testid"?: string;
}

export function FileUpload({ 
  onFilesSelected, 
  selectedFiles, 
  isUploading = false,
  "data-testid": testId 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const fileAttachments: FileAttachment[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }));

    onFilesSelected([...selectedFiles, ...fileAttachments]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (fileId: string) => {
    onFilesSelected(selectedFiles.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2" data-testid={testId}>
      {/* Compact File Input Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        data-testid="file-upload-button"
        className="text-gray-500 hover:text-gray-700 p-2"
        title="Attach medical records, test results, or images"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        multiple
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        data-testid="file-input"
      />

      {/* Compact Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-1" data-testid="selected-files">
          {selectedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-2 p-1 bg-gray-50 rounded text-xs border"
              data-testid={`file-item-${file.id}`}
            >
              {getFileIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {file.originalName}
                </p>
                <p className="text-gray-500">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                disabled={isUploading}
                data-testid={`remove-file-${file.id}`}
                className="text-gray-400 hover:text-gray-600 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Drag and Drop Area - Only show when no files selected */}
      {selectedFiles.length === 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="drop-zone"
        >
          <div className="text-xs text-gray-500">
            <p>Drop files here or click attach button</p>
            <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-xs text-blue-600 font-medium" data-testid="upload-status">
          Processing files...
        </div>
      )}
    </div>
  );
}
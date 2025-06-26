
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedPlatform: string;
  disabled?: boolean;
}

export const FileUploadZone = ({ onFileSelect, selectedPlatform, disabled }: FileUploadZoneProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please select only CSV files');
      return;
    }

    if (!selectedPlatform) {
      setError('Please select a platform first');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, selectedPlatform]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false,
    disabled
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
          "bg-gray-900 border-gray-600 hover:border-blue-500 hover:bg-gray-800",
          isDragActive && !isDragReject && "border-blue-500 bg-gray-800",
          isDragReject && "border-red-500 bg-red-900/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isDragReject ? (
            <AlertCircle className="w-12 h-12 text-red-400" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop your CSV file here' : 'Drop your CSV files here or click to browse'}
            </p>
            <p className="text-gray-400">
              Maximum file size: 10MB • Supported format: .csv
            </p>
            {!selectedPlatform && (
              <p className="text-yellow-400 text-sm">
                Please select a platform first
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

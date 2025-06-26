
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUploadZone } from "@/components/CSVUpload/FileUploadZone";
import { PlatformSelector } from "@/components/CSVUpload/PlatformSelector";
import { SampleDownloads } from "@/components/CSVUpload/SampleDownloads";
import { UploadGuidelines } from "@/components/CSVUpload/UploadGuidelines";
import { FilePreview } from "@/components/CSVUpload/FilePreview";
import { useCSVUpload } from "@/hooks/useCSVUpload";

const Upload = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  
  const { uploadFile, uploading, progress, parseCSV } = useCSVUpload();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // Parse CSV for preview
    try {
      const text = await file.text();
      const data = parseCSV(text);
      setPreviewData(data);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setPreviewData(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPlatform) return;
    
    const result = await uploadFile(selectedFile, selectedPlatform);
    
    if (result.success) {
      // Reset form after successful upload
      setSelectedFile(null);
      setPreviewData(null);
      setSelectedPlatform('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">CSV Data Upload</h1>
          <p className="text-gray-400 mt-1">Upload your advertising campaign data to analyze performance and generate insights.</p>
        </div>

        {/* Platform Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Choose Your Platform</CardTitle>
            <CardDescription className="text-gray-400">
              Select the advertising platform your CSV data is from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformSelector 
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
            />
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Your CSV File</CardTitle>
            <CardDescription className="text-gray-400">
              Drag and drop your CSV file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone 
              onFileSelect={handleFileSelect}
              selectedPlatform={selectedPlatform}
              disabled={uploading}
            />
            
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-gray-400">{progress}%</span>
                </div>
                <Progress value={progress} className="bg-gray-700" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Preview */}
        {previewData && selectedFile && (
          <FilePreview 
            file={selectedFile}
            data={previewData}
            onRemove={handleRemoveFile}
          />
        )}

        {/* Upload Button */}
        {selectedFile && selectedPlatform && !uploading && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Upload and Process Data
              </button>
            </CardContent>
          </Card>
        )}

        {/* Sample Downloads */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sample Templates</CardTitle>
            <CardDescription className="text-gray-400">
              Download sample CSV templates to see the expected format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SampleDownloads />
          </CardContent>
        </Card>

        {/* Upload Guidelines */}
        <UploadGuidelines />
      </div>
    </DashboardLayout>
  );
};

export default Upload;

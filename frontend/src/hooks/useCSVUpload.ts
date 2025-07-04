
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

export const useCSVUpload = () => {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });
  
  // Track recent uploads to prevent duplicates
  const [recentUploads, setRecentUploads] = useState<{[key: string]: number}>({});

  const uploadCSV = async (file: File, platform: string, startDate?: string, endDate?: string) => {
    try {
      // Check for recent uploads of the same file
      const uploadKey = `${file.name}-${platform}`;
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      if (recentUploads[uploadKey] && recentUploads[uploadKey] > fiveMinutesAgo) {
        const secondsAgo = Math.round((now - recentUploads[uploadKey]) / 1000);
        const errorMessage = `Duplicate upload detected. File "${file.name}" was uploaded ${secondsAgo} seconds ago. Please wait before uploading again.`;
        
        toast({
          title: 'Duplicate upload prevented',
          description: errorMessage,
          variant: 'destructive'
        });
        
        throw new Error(errorMessage);
      }
      
      setUploadState({
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });

      console.log('Starting upload process...');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Platform:', platform);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);

      const token = await getAuthToken();
      console.log('Auth token retrieved:', token ? 'Yes' : 'No');
      
      console.log('Making request to:', `${API_BASE_URL}/upload`);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Try to get response text first to see what the server is returning
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        
        // Try to parse the response as JSON to get more details
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch (parseError) {
          // If it's not JSON, use the raw text
          if (responseText) {
            errorMessage = responseText;
          }
        }
        
        console.error('Upload failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Try to parse the successful response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('Could not parse response as JSON:', parseError);
        result = { message: 'Upload completed' };
      }

      // Track this successful upload
      setRecentUploads(prev => ({
        ...prev,
        [uploadKey]: now
      }));
      
      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });

      toast({
        title: 'Upload successful',
        description: `Successfully uploaded ${file.name} for ${platform}.`
      });

      return { success: true, data: result };
    } catch (error: any) {
      console.error('CSV upload error:', error);
      const errorMessage = error.message || 'An error occurred during upload';
      
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });

      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw error;
    }
  };

  const resetUploadState = () => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    
    // Clean up old upload tracking (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    setRecentUploads(prev => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] < fiveMinutesAgo) {
          delete cleaned[key];
        }
      });
      return cleaned;
    });
  };

  // Legacy method names for backward compatibility
  const uploadFile = uploadCSV;
  const uploading = uploadState.uploading;
  const progress = uploadState.progress;

  // Simple CSV parser for preview functionality
  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const matches = [];
      let match;
      const regex = /(?:,|^)(?:"([^"]*)"|([^",]*))/g;
      
      while ((match = regex.exec(line)) !== null) {
        matches.push(match[1] || match[2] || '');
      }
      return matches;
    });
  };

  return {
    ...uploadState,
    uploadCSV,
    resetUploadState,
    // Legacy compatibility
    uploadFile,
    uploading,
    progress,
    parseCSV
  };
};

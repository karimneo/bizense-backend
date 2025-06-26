
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export const UploadGuidelines = () => {
  const requirements = {
    facebook: [
      'campaign_name (required)',
      'impressions (required)',
      'clicks (required)',
      'spend (required)',
      'conversions (optional)',
      'revenue (optional)'
    ],
    tiktok: [
      'campaign_name (required)',
      'impressions (required)',
      'clicks (required)',
      'cost (required)',
      'conversions (optional)',
      'revenue (optional)'
    ],
    google: [
      'campaign (required)',
      'impressions (required)',
      'clicks (required)',
      'cost (required)',
      'conversions (optional)',
      'conv_value (optional)'
    ]
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Upload Guidelines</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Requirements */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>File Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-gray-300 text-sm">File format: CSV (.csv)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-gray-300 text-sm">Maximum file size: 10MB</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-gray-300 text-sm">UTF-8 encoding recommended</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-gray-300 text-sm">First row should contain column headers</span>
            </div>
          </CardContent>
        </Card>

        {/* Data Guidelines */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Data Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <span className="text-gray-300 text-sm">Numeric values should use decimal notation</span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <span className="text-gray-300 text-sm">Dates should be in YYYY-MM-DD format</span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <span className="text-gray-300 text-sm">Empty cells will be treated as zero/null</span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <span className="text-gray-300 text-sm">Remove special characters from text fields</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Requirements */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Required Columns by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(requirements).map(([platform, cols]) => (
              <div key={platform} className="space-y-2">
                <h4 className="font-medium text-white capitalize">{platform} Ads</h4>
                <ul className="space-y-1">
                  {cols.map((col, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span>{col}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

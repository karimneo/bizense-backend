
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const sampleData = {
  facebook: {
    name: 'Facebook Ads Sample',
    columns: ['campaign_name', 'impressions', 'clicks', 'spend', 'conversions', 'revenue'],
    data: [
      ['Summer Sale Campaign', '10000', '500', '250.00', '25', '1250.00'],
      ['Brand Awareness Q1', '8500', '320', '180.00', '18', '900.00']
    ]
  },
  tiktok: {
    name: 'TikTok Ads Sample',
    columns: ['campaign_name', 'impressions', 'clicks', 'cost', 'conversions', 'revenue'],
    data: [
      ['Viral Video Campaign', '15000', '750', '300.00', '35', '1750.00'],
      ['Product Launch', '12000', '480', '220.00', '22', '1100.00']
    ]
  },
  google: {
    name: 'Google Ads Sample',
    columns: ['campaign', 'impressions', 'clicks', 'cost', 'conversions', 'conv_value'],
    data: [
      ['Search Campaign 1', '25000', '1200', '480.00', '60', '3000.00'],
      ['Display Campaign', '18000', '540', '270.00', '27', '1350.00']
    ]
  }
};

export const SampleDownloads = () => {
  const downloadSample = (platform: string) => {
    const sample = sampleData[platform as keyof typeof sampleData];
    const csvContent = [
      sample.columns.join(','),
      ...sample.data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}_sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Download Sample Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sampleData).map(([platform, data]) => (
          <Button
            key={platform}
            variant="outline"
            onClick={() => downloadSample(platform)}
            className="bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-white h-auto p-4 flex flex-col items-center space-y-2"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">{data.name}</span>
            <span className="text-xs text-gray-400">
              {data.columns.length} columns
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

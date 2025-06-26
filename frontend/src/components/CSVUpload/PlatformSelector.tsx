
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PlatformSelectorProps {
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
}

const platforms = [
  {
    id: 'facebook',
    name: 'Facebook Ads',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: '📘'
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    icon: '🎵'
  },
  {
    id: 'google',
    name: 'Google Ads',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
    icon: '🟢'
  }
];

export const PlatformSelector = ({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Select Platform</h3>
      <RadioGroup value={selectedPlatform} onValueChange={onPlatformChange}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="relative">
              <RadioGroupItem
                value={platform.id}
                id={platform.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={platform.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-800 ${
                  selectedPlatform === platform.id
                    ? platform.bgColor
                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className={`font-medium ${
                  selectedPlatform === platform.id ? platform.color : 'text-white'
                }`}>
                  {platform.name}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

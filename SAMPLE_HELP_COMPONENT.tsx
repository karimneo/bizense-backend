// Sample React Component for KPI Help System
// Note: This is a reference implementation for Lovable team

import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

interface KPIItem {
  name: string;
  formula: string;
  example: string;
  description: string;
  importance: string;
  benchmark?: {
    good: string;
    great: string;
    exceptional: string;
  };
}

const KPIHelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, initialTab = 'financial' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const kpiData: Record<string, KPIItem[]> = {
    financial: [
      {
        name: 'Revenue',
        formula: 'Selling Price × Units Delivered',
        example: '$29.99 × 70 = $2,099.30',
        description: 'Total money earned from product sales',
        importance: 'This is your gross income before any costs',
        benchmark: { good: '$500+', great: '$2000+', exceptional: '$5000+' }
      },
      {
        name: 'Ad Spend',
        formula: 'Sum of all campaign costs',
        example: 'Facebook campaigns = $81.08',
        description: 'Total money spent on advertising campaigns',
        importance: 'Your primary marketing investment'
      }
    ],
    profitability: [
      {
        name: 'Delivered Profit',
        formula: 'Revenue - Product Cost - Ad Spend',
        example: '$2,099.30 - $160.30 - $81.08 = $1,857.92',
        description: 'Profit from units actually delivered',
        importance: 'Your actual realized profit',
        benchmark: { good: '>$0', great: '>$500', exceptional: '>$2000' }
      }
    ],
    ratios: [
      {
        name: 'ROI (Return on Investment)',
        formula: '(Delivered Profit ÷ Ad Spend) × 100',
        example: '($1,857.92 ÷ $81.08) × 100 = 2,291.47%',
        description: 'Profit efficiency on ad spend',
        importance: 'Shows advertising effectiveness',
        benchmark: { good: '>100%', great: '>300%', exceptional: '>1000%' }
      },
      {
        name: 'ROAS (Return on Ad Spend)',
        formula: 'Revenue ÷ Ad Spend',
        example: '$2,099.30 ÷ $81.08 = 25.89',
        description: 'Revenue generated per dollar spent on ads',
        importance: 'Direct advertising effectiveness',
        benchmark: { good: '>3.0', great: '>8.0', exceptional: '>20.0' }
      }
    ]
  };

  const renderKPICard = (kpi: KPIItem) => (
    <div key={kpi.name} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
        {kpi.benchmark && (
          <div className="flex space-x-1">
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Good: {kpi.benchmark.good}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Great: {kpi.benchmark.great}
            </span>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
              Exceptional: {kpi.benchmark.exceptional}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">Formula:</span>
          <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">{kpi.formula}</code>
        </div>
        <div>
          <span className="font-medium text-gray-600">Example:</span>
          <span className="ml-2 text-gray-800">{kpi.example}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">What it measures:</span>
          <p className="ml-2 text-gray-700">{kpi.description}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Why it matters:</span>
          <p className="ml-2 text-gray-700">{kpi.importance}</p>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">📊 KPI Help Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {Object.keys(kpiData).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tabKey
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tabKey}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
              {activeTab} Metrics
            </h3>
            <p className="text-gray-600 text-sm">
              Understanding these metrics will help you make better business decisions.
            </p>
          </div>
          
          <div className="space-y-4">
            {kpiData[activeTab]?.map(renderKPICard)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Need more help? Contact support or check our video tutorials.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Help Button Component
export const HelpButton: React.FC<{ onClick: () => void; metric?: string; className?: string }> = ({ 
  onClick, 
  metric, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 text-gray-400 hover:text-blue-600 transition-colors ${className}`}
      title={`Learn about ${metric || 'this metric'}`}
    >
      <span className="text-sm">❓</span>
    </button>
  );
};

// Usage Example Component
export const ProductDetailWithHelp: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState('financial');

  const openHelp = (topic: string = 'financial') => {
    setHelpTopic(topic);
    setShowHelp(true);
  };

  return (
    <div className="p-6">
      {/* Example Metric Cards with Help Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <HelpButton onClick={() => openHelp('financial')} metric="Revenue" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">$2,099.30</p>
          <p className="text-sm text-green-600">+15% from last month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">ROI</h3>
            <HelpButton onClick={() => openHelp('ratios')} metric="ROI" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">2,291.47%</p>
          <p className="text-sm text-green-600">🚀 Exceptional!</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">ROAS</h3>
            <HelpButton onClick={() => openHelp('ratios')} metric="ROAS" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">25.89</p>
          <p className="text-sm text-green-600">🔥 Great performance!</p>
        </div>
      </div>

      {/* Global Help Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openHelp('financial')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <span>❓</span>
          <span>Explain All Metrics</span>
        </button>
      </div>

      {/* Help Modal */}
      <KPIHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        initialTab={helpTopic}
      />
    </div>
  );
};

export default KPIHelpModal; 
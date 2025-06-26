
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save, Download, RefreshCw } from 'lucide-react';

interface CalculatorInputs {
  productPrice: number;
  unitCost: number;
  costPerLead: number;
  confirmationRate: number;
  deliveryRate: number;
  targetLeads: number;
}

interface CalculatorResults {
  confirmedLeads: number;
  deliveredLeads: number;
  totalAdSpend: number;
  productCost: number;
  serviceCost: number;
  codFees: number;
  grossRevenue: number;
  netProfit: number;
  roas: number;
}

const ROASCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    productPrice: 50,
    unitCost: 20,
    costPerLead: 0.5,
    confirmationRate: 30,
    deliveryRate: 80,
    targetLeads: 1000,
  });

  const [results, setResults] = useState<CalculatorResults>({
    confirmedLeads: 0,
    deliveredLeads: 0,
    totalAdSpend: 0,
    productCost: 0,
    serviceCost: 0,
    codFees: 0,
    grossRevenue: 0,
    netProfit: 0,
    roas: 0,
  });

  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string;
    inputs: CalculatorInputs;
    results: CalculatorResults;
  }>>([]);

  // Calculate results whenever inputs change
  useEffect(() => {
    const confirmedLeads = Math.round(inputs.targetLeads * (inputs.confirmationRate / 100));
    const deliveredLeads = Math.round(confirmedLeads * (inputs.deliveryRate / 100));
    const totalAdSpend = inputs.targetLeads * inputs.costPerLead;
    const productCost = deliveredLeads * inputs.unitCost;
    const serviceCost = (deliveredLeads * 8.5) + (inputs.targetLeads * 0.1);
    const grossRevenue = deliveredLeads * inputs.productPrice;
    const codFees = grossRevenue * 0.05;
    const netProfit = grossRevenue - totalAdSpend - productCost - serviceCost - codFees;
    const roas = totalAdSpend > 0 ? (grossRevenue / totalAdSpend) * 100 : 0;

    setResults({
      confirmedLeads,
      deliveredLeads,
      totalAdSpend,
      productCost,
      serviceCost,
      codFees,
      grossRevenue,
      netProfit,
      roas,
    });
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const resetInputs = () => {
    setInputs({
      productPrice: 50,
      unitCost: 20,
      costPerLead: 0.5,
      confirmationRate: 30,
      deliveryRate: 80,
      targetLeads: 1000,
    });
  };

  const saveScenario = () => {
    const name = `Scenario ${savedScenarios.length + 1}`;
    setSavedScenarios(prev => [...prev, { name, inputs: { ...inputs }, results: { ...results } }]);
  };

  const loadScenario = (scenario: typeof savedScenarios[0]) => {
    setInputs(scenario.inputs);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ROAS Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Simulate campaign performance before launch</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Campaign Inputs
                  <Button onClick={resetInputs} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productPrice">Product Price ($)</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      step="0.01"
                      value={inputs.productPrice}
                      onChange={(e) => handleInputChange('productPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost ($)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={inputs.unitCost}
                      onChange={(e) => handleInputChange('unitCost', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPerLead">Cost per Lead ($)</Label>
                    <Input
                      id="costPerLead"
                      type="number"
                      step="0.01"
                      value={inputs.costPerLead}
                      onChange={(e) => handleInputChange('costPerLead', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetLeads">Target Leads</Label>
                    <Input
                      id="targetLeads"
                      type="number"
                      value={inputs.targetLeads}
                      onChange={(e) => handleInputChange('targetLeads', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confirmationRate">Confirmation Rate (%)</Label>
                    <Input
                      id="confirmationRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={inputs.confirmationRate}
                      onChange={(e) => handleInputChange('confirmationRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryRate">Delivery Rate (%)</Label>
                    <Input
                      id="deliveryRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={inputs.deliveryRate}
                      onChange={(e) => handleInputChange('deliveryRate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={saveScenario} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedScenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ROAS: {scenario.results.roas.toFixed(1)}% | 
                            Profit: ${scenario.results.netProfit.toFixed(2)}
                          </p>
                        </div>
                        <Button 
                          onClick={() => loadScenario(scenario)}
                          variant="outline" 
                          size="sm"
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.roas.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${results.netProfit.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Confirmed Leads</span>
                    <Badge variant="secondary">{results.confirmedLeads.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Delivered Orders</span>
                    <Badge variant="secondary">{results.deliveredLeads.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Total Ad Spend</span>
                    <Badge variant="destructive">${results.totalAdSpend.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Gross Revenue</span>
                    <Badge className="bg-green-600 hover:bg-green-700">${results.grossRevenue.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Product Cost</span>
                    <Badge variant="destructive">${results.productCost.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Service Fees</span>
                    <Badge variant="destructive">${results.serviceCost.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>COD Fees (5%)</span>
                    <Badge variant="destructive">${results.codFees.toFixed(2)}</Badge>
                  </div>
                </div>

                {/* Profit Indicator */}
                <div className={`p-4 rounded-lg text-center ${
                  results.netProfit > 0 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-2xl font-bold ${results.netProfit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {results.netProfit > 0 ? '✅ Profitable' : '❌ Loss'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {results.netProfit > 0 
                      ? `Profit margin: ${((results.netProfit / results.grossRevenue) * 100).toFixed(1)}%`
                      : 'Consider adjusting parameters'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ROASCalculator;

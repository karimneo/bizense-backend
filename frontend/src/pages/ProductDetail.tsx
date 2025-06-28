import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Save, X, TrendingUp, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ProductMetrics {
  id: string;
  product_name: string;
  unit_cost: number;
  selling_price: number;
  units_delivered: number;
  stock_purchased: number;
  total_ad_spend: number;
  total_leads: number;
  total_confirmed_leads: number;
  total_delivered_orders: number;
}

interface CampaignData {
  id: string;
  campaign_name: string;
  platform: string;
  amount_spent: number;
  leads: number;
  confirmed_leads: number;
  delivered_orders: number;
  date_created: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    unit_cost: 0,
    selling_price: 0,
    units_delivered: 0,
    stock_purchased: 0,
  });
  const [loading, setLoading] = useState(true);

  // Real API calls to connect to your backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('supabase-auth-token');
        
        console.log('🔍 Fetching product with ID:', id);
        
        const response = await fetch(`http://localhost:3001/api/products/${id}/detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Product data received:', data);
        
        setProduct(data);
        setEditValues({
          unit_cost: data.unit_cost || 0,
          selling_price: data.selling_price || 0,
          units_delivered: data.units_delivered || 0,
          stock_purchased: data.stock_purchased || 0,
        });
        
      } catch (error) {
        console.error('❌ Failed to fetch product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Calculate metrics
  const calculateMetrics = () => {
    if (!product) return null;

    const totalProductCost = product.units_delivered * product.unit_cost;
    const cashCollected = product.units_delivered * product.selling_price;
    const codFees = cashCollected * 0.05;
    const serviceFees = (product.total_delivered_orders * 8.5) + (product.total_leads * 0.1);
    const netProfit = cashCollected - product.total_ad_spend - codFees - serviceFees - totalProductCost;
    const cpa = product.total_leads > 0 ? product.total_ad_spend / product.total_leads : 0;
    const costPerDelivered = product.total_delivered_orders > 0 ? product.total_ad_spend / product.total_delivered_orders : 0;
    const roas = product.total_ad_spend > 0 ? (cashCollected / product.total_ad_spend) * 100 : 0;

    return {
      totalProductCost,
      cashCollected,
      codFees,
      serviceFees,
      netProfit,
      cpa,
      costPerDelivered,
      roas,
    };
  };

  const metrics = calculateMetrics();

  const handleSave = async () => {
    if (!product) return;
    
    try {
      const token = localStorage.getItem('supabase-auth-token');
      
      console.log('💾 Saving product with values:', editValues);
      
      const response = await fetch(`http://localhost:3001/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit_cost: editValues.unit_cost,
          selling_price: editValues.selling_price,
          units_delivered: editValues.units_delivered,
          stock_purchased: editValues.stock_purchased,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`);
      }

      const updatedProduct = await response.json();
      console.log('✅ Product updated successfully:', updatedProduct);
      
      // Update local state with new values
      setProduct(prev => prev ? { ...prev, ...editValues } : null);
      setIsEditing(false);
      toast.success('Product updated successfully!');
      
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      toast.error('Failed to update product. Please try again.');
    }
  };

  const handleCancel = () => {
    if (!product) return;
    setEditValues({
      unit_cost: product.unit_cost,
      selling_price: product.selling_price,
      units_delivered: product.units_delivered,
      stock_purchased: product.stock_purchased,
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading product details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Product not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/products')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{product.product_name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Product Performance & Metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Manual Input Fields */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    value={isEditing ? editValues.unit_cost : product.unit_cost}
                    onChange={(e) => setEditValues(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price ($)</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={isEditing ? editValues.selling_price : product.selling_price}
                    onChange={(e) => setEditValues(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="units_delivered">Units Delivered</Label>
                  <Input
                    id="units_delivered"
                    type="number"
                    value={isEditing ? editValues.units_delivered : product.units_delivered}
                    onChange={(e) => setEditValues(prev => ({ ...prev, units_delivered: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="stock_purchased">Stock Purchased</Label>
                  <Input
                    id="stock_purchased"
                    type="number"
                    value={isEditing ? editValues.stock_purchased : product.stock_purchased}
                    onChange={(e) => setEditValues(prev => ({ ...prev, stock_purchased: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>CPA</span>
                  <Badge variant="secondary">${metrics.cpa.toFixed(2)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cost per Delivered</span>
                  <Badge variant="secondary">${metrics.costPerDelivered.toFixed(2)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>ROAS</span>
                  <Badge variant={metrics.roas >= 200 ? "default" : "destructive"} className={metrics.roas >= 200 ? "bg-green-600 hover:bg-green-700" : ""}>
                    {metrics.roas.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculated Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cash Collected</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">${metrics.cashCollected.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Product Cost</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${metrics.totalProductCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Ad Spend</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${product.total_ad_spend.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">COD Fees (5%)</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">${metrics.codFees.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Service Fees</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${metrics.serviceFees.toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      metrics.netProfit > 0 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                      <p className={`text-2xl font-bold ${metrics.netProfit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${metrics.netProfit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Campaign</th>
                        <th className="text-left py-3 px-4">Platform</th>
                        <th className="text-right py-3 px-4">Ad Spend</th>
                        <th className="text-right py-3 px-4">Leads</th>
                        <th className="text-right py-3 px-4">Confirmed</th>
                        <th className="text-right py-3 px-4">Delivered</th>
                        <th className="text-right py-3 px-4">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b">
                          <td className="py-3 px-4">{campaign.campaign_name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {campaign.platform}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">${campaign.amount_spent.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">{campaign.leads.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{campaign.confirmed_leads.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{campaign.delivered_orders.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            ${campaign.leads > 0 ? (campaign.amount_spent / campaign.leads).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;

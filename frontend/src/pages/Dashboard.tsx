
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Target, Users, Facebook, Youtube, Search, Package, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - replace with actual API calls
  const kpiData = {
    totalSpend: 15750,
    totalLeads: 2840,
    confirmedOrders: 1420,
    totalRevenue: 284000,
    conversionRate: 50.0,
    roas: 18.03
  };

  const platformData = [
    { name: 'Facebook', spend: 8500, leads: 1200, revenue: 150000, color: '#1877F2' },
    { name: 'TikTok', spend: 4200, leads: 890, revenue: 89000, color: '#FF0050' },
    { name: 'Google', spend: 3050, leads: 750, revenue: 45000, color: '#4285F4' }
  ];

  const dailyPerformance = [
    { date: '2024-01-01', spend: 1200, leads: 180, revenue: 18000 },
    { date: '2024-01-02', spend: 1350, leads: 210, revenue: 21000 },
    { date: '2024-01-03', spend: 1100, leads: 165, revenue: 16500 },
    { date: '2024-01-04', spend: 1450, leads: 220, revenue: 22000 },
    { date: '2024-01-05', spend: 1300, leads: 195, revenue: 19500 },
    { date: '2024-01-06', spend: 1600, leads: 240, revenue: 24000 },
    { date: '2024-01-07', spend: 1400, leads: 210, revenue: 21000 }
  ];

  const topProducts = [
    {
      id: '1',
      name: 'SuperSlim Pro',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      spend: 5200,
      leads: 780,
      revenue: 78000,
      roas: 15.0
    },
    {
      id: '2',
      name: 'FitMax Elite',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      spend: 3800,
      leads: 640,
      revenue: 64000,
      roas: 16.8
    },
    {
      id: '3',
      name: 'WellnessCore Basic',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      spend: 2900,
      leads: 520,
      revenue: 52000,
      roas: 17.9
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'tiktok':
        return Youtube;
      case 'google':
        return Search;
      default:
        return Facebook;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BiZense Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Your ecommerce intelligence overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Ad Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(kpiData.totalSpend)}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{kpiData.totalLeads.toLocaleString()}</div>
              <p className="text-xs text-green-600 dark:text-green-400">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Confirmed Orders</CardTitle>
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{kpiData.confirmedOrders.toLocaleString()}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">{kpiData.conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(kpiData.totalRevenue)}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">{kpiData.roas}x ROAS</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Trend</CardTitle>
              <CardDescription>Spend, Leads, and Revenue over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'spend' || name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'spend' ? 'Spend' : name === 'leads' ? 'Leads' : 'Revenue'
                    ]}
                  />
                  <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Revenue distribution by advertising platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformData.map((platform) => {
                  const Icon = getPlatformIcon(platform.name);
                  return (
                    <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" style={{ color: platform.color }} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{platform.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{platform.leads} leads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(platform.revenue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(platform.spend)} spent</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Your best products by ROAS performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProducts.map((product, index) => (
                <div key={product.id} className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.leads} leads</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(product.revenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spend:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(product.spend)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">ROAS:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{product.roas}x</span>
                    </div>
                  </div>
                  <Link to={`/products/${product.id}`}>
                    <Button size="sm" className="w-full mt-3" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Target, Users, Facebook, Youtube, Search, Package, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";

const Dashboard = () => {
  const { loading: dashboardLoading, error: dashboardError, ...dashboardData } = useDashboardData();
  const { products, loading: productsLoading } = useProducts();

  // Calculate real KPIs from products data
  const kpiData = useMemo(() => {
    if (!products.length) {
      return {
        totalSpend: 0,
        totalConversions: 0,
        totalRevenue: 0,
        totalProfit: 0,
        roas: 0,
        roi: 0,
        productCount: 0
      };
    }

    const totals = products.reduce((acc, product) => {
      acc.totalSpend += product.total_spend || 0;
      acc.totalRevenue += product.total_revenue || 0;
      acc.totalProfit += product.profit || 0;
      acc.totalConversions += product.total_conversions || 0;
      return acc;
    }, {
      totalSpend: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalConversions: 0
    });

    return {
      ...totals,
      roas: totals.totalSpend > 0 ? (totals.totalRevenue / totals.totalSpend) : 0,
      roi: totals.totalSpend > 0 ? ((totals.totalProfit / totals.totalSpend) * 100) : 0,
      productCount: products.length
    };
  }, [products]);

  // Get platform data from products
  const platformData = useMemo(() => {
    const platformMap = new Map();
    
    products.forEach(product => {
      if (product.platform_performance) {
        Object.entries(product.platform_performance).forEach(([platform, data]: [string, any]) => {
          if (!platformMap.has(platform)) {
            platformMap.set(platform, {
              name: platform.charAt(0).toUpperCase() + platform.slice(1),
              spend: 0,
              revenue: 0,
              conversions: 0,
              color: platform === 'facebook' ? '#1877F2' : platform === 'google' ? '#4285F4' : '#FF0050'
            });
          }
          const current = platformMap.get(platform);
          current.spend += data.spend || 0;
          current.revenue += data.revenue || 0;
          current.conversions += data.conversions || 0;
        });
      }
    });

    return Array.from(platformMap.values());
  }, [products]);

  // Get top products (real data!)
  const topProducts = useMemo(() => {
    return products
      .sort((a, b) => (b.roi || 0) - (a.roi || 0))
      .slice(0, 3)
      .map(product => ({
        id: product.id.toString(),
        name: product.product_name,
        spend: product.total_spend || 0,
        revenue: product.total_revenue || 0,
        profit: product.profit || 0,
        roi: product.roi || 0,
        roas: product.roas || 0
      }));
  }, [products]);

  // Loading state
  if (dashboardLoading || productsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BiZense Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Loading your ecommerce intelligence...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        {/* KPI Cards - NOW WITH REAL DATA! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Ad Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(kpiData.totalSpend)}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">{kpiData.productCount} products tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(kpiData.totalRevenue)}</div>
              <p className="text-xs text-green-600 dark:text-green-400">{kpiData.roas.toFixed(2)}x ROAS</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Profit</CardTitle>
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(kpiData.totalProfit)}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">{kpiData.roi.toFixed(1)}% ROI</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Conversions</CardTitle>
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{kpiData.totalConversions.toLocaleString()}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">Across all products</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Performance - REAL DATA */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Revenue and spend by advertising platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformData.length > 0 ? platformData.map((platform) => {
                  const Icon = getPlatformIcon(platform.name);
                  const platformROAS = platform.spend > 0 ? (platform.revenue / platform.spend) : 0;
                  return (
                    <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" style={{ color: platform.color }} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{platform.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{platform.conversions} conversions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(platform.revenue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(platform.spend)} spent ({platformROAS.toFixed(1)}x)</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No platform data available yet</p>
                    <p className="text-sm">Upload some campaign data to see platform performance</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products - REAL DATA with your incredible ROI! */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Your best products by ROI performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(product.spend)} → {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={product.roi > 100 ? "default" : "secondary"} className="mb-1">
                        {product.roi.toFixed(1)}% ROI
                      </Badge>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.profit)} profit
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products found</p>
                    <p className="text-sm">Upload campaign data to start tracking products</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/products">
              <CardHeader className="text-center">
                <Package className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>View and edit your product performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Products
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/upload">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <CardTitle>Upload Data</CardTitle>
                <CardDescription>Add new campaign data and track performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Upload Campaigns
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/reports">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                <CardTitle>View Reports</CardTitle>
                <CardDescription>Analyze your upload history and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Performance Alert */}
        {kpiData.roi > 1000 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Exceptional Performance!</h3>
              </div>
              <p className="text-green-700 dark:text-green-300">
                🎉 Incredible ROI of {kpiData.roi.toFixed(1)}%! Your products are performing phenomenally well.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

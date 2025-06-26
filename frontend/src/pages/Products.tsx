import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, TrendingUp, DollarSign, Eye, Edit3, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';

interface Product {
  id: number;
  product_name: string;
  revenue_per_conversion?: number;
  user_id?: string;
  created_at?: string;
  best_platform?: string;
  total_revenue?: number;
  total_spend?: number;
  // Adding computed fields for display
  unit_cost?: number;
  selling_price?: number;
  units_delivered?: number;
  stock_purchased?: number;
  total_campaigns?: number;
  roas?: number;
}

const Products = () => {
  const navigate = useNavigate();
  const { products, loading, addProduct, deleteProduct, refetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    revenue_per_conversion: 0,
  });

  const handleCreateProduct = async () => {
    if (!newProduct.product_name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      await addProduct(newProduct);
      setIsCreateModalOpen(false);
      setNewProduct({
        product_name: '',
        revenue_per_conversion: 0,
      });
      toast.success('Product created successfully!');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateNetProfit = (product: Product) => {
    const revenue = product.total_revenue || 0;
    const spend = product.total_spend || 0;
    return revenue - spend;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
              <p className="text-gray-300">Manage your product catalog and performance</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                      id="product_name"
                      value={newProduct.product_name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue_per_conversion">Revenue per Conversion ($)</Label>
                    <Input
                      id="revenue_per_conversion"
                      type="number"
                      step="0.01"
                      value={newProduct.revenue_per_conversion}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, revenue_per_conversion: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateProduct} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Create Product
                    </Button>
                    <Button 
                      onClick={() => setIsCreateModalOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-400 text-center mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Upload some CSV data or create your first product to start tracking performance'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-4">
                  <Button 
                    onClick={() => navigate('/upload')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload CSV Data
                  </Button>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product Manually
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const netProfit = calculateNetProfit(product);
              const roas = (product.total_spend && product.total_spend > 0) 
                ? ((product.total_revenue || 0) / product.total_spend) * 100 
                : 0;

              return (
                <Card key={product.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{product.product_name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.total_campaigns || 0} campaigns
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {product.best_platform || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => navigate(`/products/${product.id}`)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id, product.product_name)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                        <p className="text-xs text-gray-300 mb-1">ROAS</p>
                        <p className="text-lg font-bold text-blue-400">{roas.toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                        <p className="text-xs text-gray-300 mb-1">Net Profit</p>
                        <p className={`text-lg font-bold ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${netProfit.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Spend:</span>
                        <span className="text-white">${(product.total_spend || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue:</span>
                        <span className="text-white">${(product.total_revenue || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue/Conv:</span>
                        <span className="text-white">${(product.revenue_per_conversion || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                      variant="secondary"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-sm">Total Spend</p>
                <p className="text-2xl font-bold text-white">
                  ${filteredProducts.reduce((sum, p) => sum + (p.total_spend || 0), 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${filteredProducts.reduce((sum, p) => sum + (p.total_revenue || 0), 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-sm">Avg ROAS</p>
                <p className="text-2xl font-bold text-white">
                  {filteredProducts.length > 0 
                    ? (filteredProducts.reduce((sum, p) => {
                        const roas = (p.total_spend && p.total_spend > 0) 
                          ? ((p.total_revenue || 0) / p.total_spend) * 100 
                          : 0;
                        return sum + roas;
                      }, 0) / filteredProducts.length).toFixed(1)
                    : '0.0'}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
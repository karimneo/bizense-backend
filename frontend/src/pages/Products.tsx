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
    product.product_name.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Debug logs
  console.log('Products:', products);
  console.log('Filtered:', filteredProducts);

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
              <DialogContent>
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

        {/* Simple Products List for Debugging */}
        <div>
          {filteredProducts && filteredProducts.length > 0 ? (
            <div>
              {filteredProducts.map(product => (
                <div key={product.id} style={{border: "1px solid #444", margin: "10px", padding: "10px", color: "white"}}>
                  <h3>{product.product_name}</h3>
                  <p>Revenue per conversion: {product.revenue_per_conversion}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{color: "white"}}>No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
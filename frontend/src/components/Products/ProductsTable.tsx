import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Facebook, Youtube, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Product {
  id: number;
  product_name: string;
  revenue_per_conversion: number;
  best_platform?: string;
  total_revenue?: number;
  total_spend?: number;
}

interface ProductsTableProps {
  products: Product[];
  selectedProducts: number[];
  onSelectProducts: (ids: number[]) => void;
  onUpdateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
}

const PlatformIcon = ({ platform }: { platform?: string }) => {
  if (!platform) return null;
  
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <Facebook className="w-4 h-4 text-blue-600" />;
    case 'tiktok':
      return <Youtube className="w-4 h-4 text-black dark:text-white" />;
    case 'google':
      return <Search className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export const ProductsTable = ({
  products,
  selectedProducts,
  onSelectProducts,
  onUpdateProduct,
  onDeleteProduct
}: ProductsTableProps) => {
  const [editingRevenue, setEditingRevenue] = useState<number | null>(null);
  const [tempRevenue, setTempRevenue] = useState<string>("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(products.map(p => p.id));
    } else {
      onSelectProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      onSelectProducts([...selectedProducts, productId]);
    } else {
      onSelectProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleEditRevenue = (product: Product) => {
    setEditingRevenue(product.id);
    setTempRevenue(product.revenue_per_conversion.toString());
  };

  const handleSaveRevenue = async (productId: number) => {
    const newRevenue = parseFloat(tempRevenue);
    if (isNaN(newRevenue) || newRevenue < 0) {
      toast.error("Please enter a valid revenue amount");
      return;
    }

    try {
      await onUpdateProduct(productId, { revenue_per_conversion: newRevenue });
      setEditingRevenue(null);
      toast.success("Revenue per conversion updated");
    } catch (error) {
      toast.error("Failed to update revenue");
    }
  };

  const handleCancelEdit = () => {
    setEditingRevenue(null);
    setTempRevenue("");
  };

  const handleDelete = async (productId: number) => {
    try {
      await onDeleteProduct(productId);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedProducts.length === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
                className="border-gray-300 dark:border-gray-600"
              />
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Product Name</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Revenue/Conversion</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Best Platform</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Total Revenue</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Total Spend</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                  className="border-gray-300 dark:border-gray-600"
                />
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                {product.product_name}
              </TableCell>
              <TableCell>
                {editingRevenue === product.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={tempRevenue}
                      onChange={(e) => setTempRevenue(e.target.value)}
                      className="w-24 h-8 bg-gray-50 dark:bg-gray-700"
                      step="0.01"
                      min="0"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveRevenue(product.id)}
                      className="h-8 px-2 bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditRevenue(product)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {formatCurrency(product.revenue_per_conversion)}
                  </button>
                )}
              </TableCell>
              <TableCell>
                {product.best_platform && (
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={product.best_platform} />
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {product.best_platform}
                    </Badge>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(product.total_revenue)}
              </TableCell>
              <TableCell className="text-red-600 dark:text-red-400 font-medium">
                {formatCurrency(product.total_spend)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRevenue(product)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                          Delete Product
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                          Are you sure you want to delete "{product.product_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-300 dark:border-gray-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

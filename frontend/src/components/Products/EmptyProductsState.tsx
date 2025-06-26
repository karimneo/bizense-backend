
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyProductsStateProps {
  onAddProduct: () => void;
}

export const EmptyProductsState = ({ onAddProduct }: EmptyProductsStateProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your products and track their performance across platforms.
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start by adding your first product to track its performance across different advertising platforms.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={onAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Products help you:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Track revenue per conversion</li>
                  <li>• Compare performance across platforms</li>
                  <li>• Calculate total revenue and spend</li>
                  <li>• Optimize your advertising campaigns</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

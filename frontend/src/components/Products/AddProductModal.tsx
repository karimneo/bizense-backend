
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { product_name: string; revenue_per_conversion: number }) => Promise<void>;
}

export const AddProductModal = ({ isOpen, onClose, onAdd }: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    product_name: "",
    revenue_per_conversion: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }

    if (!formData.revenue_per_conversion.trim()) {
      newErrors.revenue_per_conversion = "Revenue per conversion is required";
    } else {
      const revenue = parseFloat(formData.revenue_per_conversion);
      if (isNaN(revenue) || revenue < 0) {
        newErrors.revenue_per_conversion = "Please enter a valid revenue amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        product_name: formData.product_name.trim(),
        revenue_per_conversion: parseFloat(formData.revenue_per_conversion)
      });
      
      toast.success("Product added successfully");
      handleClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ product_name: "", revenue_per_conversion: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Product
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name" className="text-gray-700 dark:text-gray-300">
              Product Name
            </Label>
            <Input
              id="product_name"
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="Enter product name"
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
            {errors.product_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.product_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue_per_conversion" className="text-gray-700 dark:text-gray-300">
              Revenue per Conversion ($)
            </Label>
            <Input
              id="revenue_per_conversion"
              type="number"
              step="0.01"
              min="0"
              value={formData.revenue_per_conversion}
              onChange={(e) => setFormData(prev => ({ ...prev, revenue_per_conversion: e.target.value }))}
              placeholder="0.00"
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
            {errors.revenue_per_conversion && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.revenue_per_conversion}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

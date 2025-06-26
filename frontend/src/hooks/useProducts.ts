
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: number;
  product_name: string;
  revenue_per_conversion: number;
  user_id?: string;
  created_at?: string;
  best_platform?: string;
  total_revenue?: number;
  total_spend?: number;
}

interface ProductWithStats extends Product {
  best_platform?: string;
  total_revenue?: number;
  total_spend?: number;
}

const API_BASE_URL = 'https://bizense-backend.onrender.com/api';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall('/products');
      setProducts(result.products || []);
    } catch (error: any) {
      console.error('Products fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: { product_name: string; revenue_per_conversion: number }): Promise<void> => {
    try {
      const result = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      
      await fetchProducts();
      return result;
    } catch (error) {
      console.error('Product creation error:', error);
      throw error;
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const result = await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      await fetchProducts();
      return result;
    } catch (error) {
      console.error('Product update error:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiCall(`/products/${id}`, {
        method: 'DELETE',
      });
      
      await fetchProducts();
    } catch (error) {
      console.error('Product deletion error:', error);
      throw error;
    }
  };

  const deleteMultipleProducts = async (ids: number[]) => {
    try {
      await apiCall('/products/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
      
      await fetchProducts();
    } catch (error) {
      console.error('Bulk product deletion error:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    refetch: fetchProducts
  };
};

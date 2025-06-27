// API Configuration
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api'  // Local development
  : 'https://bizense-backend.onrender.com/api';  // Production

console.log('API Base URL:', API_BASE_URL); 

interface Product {
  id: number;
  product_name: string;
  // Manual fields (user inputs)
  unit_cost: number;
  selling_price: number;  
  units_delivered: number;
  stock_purchased: number;
  revenue_per_conversion: number;
  // Auto-calculated fields (from campaigns)
  total_revenue: number;
  total_spend: number;
  roas: number;
  best_platform: string;
  created_at: string;
} 
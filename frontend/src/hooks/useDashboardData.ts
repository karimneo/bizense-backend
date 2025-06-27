
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/config/api';

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

interface PlatformStats {
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
}

interface RecentUpload {
  date: string;
  platform: string;
  fileName: string;
  status: string;
}

export const useDashboardData = () => {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    platformStats: [] as PlatformStats[],
    recentUploads: [] as RecentUpload[],
    loading: true,
    error: null as string | null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await apiCall('/dashboard');
      
      setData({
        totalRevenue: result.totalRevenue || 0,
        totalOrders: result.totalOrders || 0,
        averageOrderValue: result.averageOrderValue || 0,
        conversionRate: result.conversionRate || 0,
        platformStats: result.platformStats || [],
        recentUploads: result.recentUploads || [],
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { ...data, refetch: fetchDashboardData };
};

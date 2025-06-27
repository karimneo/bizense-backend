
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

interface UploadRecord {
  id: number;
  file_name: string;
  platform: string;
  upload_date: string;
  rows_processed: number;
  status: string;
}

interface SummaryStats {
  totalUploads: number;
  successRate: number;
  totalRowsProcessed: number;
  recentActivity: number;
}

interface UseUploadHistoryProps {
  searchTerm: string;
  platformFilter: string;
  dateRange?: DateRange;
  page: number;
  limit: number;
}

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

export const useUploadHistory = ({
  searchTerm,
  platformFilter,
  dateRange,
  page,
  limit
}: UseUploadHistoryProps) => {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalUploads: 0,
    successRate: 0,
    totalRowsProcessed: 0,
    recentActivity: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUploads = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (platformFilter && platformFilter !== 'all') {
        params.append('platform', platformFilter);
      }

      if (dateRange?.from) {
        params.append('dateFrom', dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        params.append('dateTo', dateRange.to.toISOString());
      }

      const result = await apiCall(`/upload-history?${params.toString()}`);

      setUploads(result.uploads || []);
      setTotalCount(result.totalCount || 0);
    } catch (error: any) {
      console.error('Error fetching uploads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch upload history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryStats = async () => {
    if (!user) return;

    try {
      const result = await apiCall('/upload-history/stats');
      
      setSummaryStats({
        totalUploads: result.totalUploads || 0,
        successRate: result.successRate || 0,
        totalRowsProcessed: result.totalRowsProcessed || 0,
        recentActivity: result.recentActivity || 0
      });
    } catch (error: any) {
      console.error('Error fetching summary stats:', error);
    }
  };

  const deleteUpload = async (id: number) => {
    if (!user) return;

    try {
      await apiCall(`/upload-history/${id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Success',
        description: 'Upload record deleted successfully'
      });

      fetchUploads();
      fetchSummaryStats();
    } catch (error: any) {
      console.error('Error deleting upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete upload record',
        variant: 'destructive'
      });
    }
  };

  const reprocessUpload = async (id: number) => {
    if (!user) return;

    try {
      await apiCall(`/upload-history/${id}/reprocess`, {
        method: 'POST',
      });

      toast({
        title: 'Success',
        description: 'Upload queued for reprocessing'
      });

      fetchUploads();
    } catch (error: any) {
      console.error('Error reprocessing upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to reprocess upload',
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = async () => {
    if (!user) return;

    try {
      // Build query parameters for export (without pagination)
      const params = new URLSearchParams();
      params.append('export', 'true');

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (platformFilter && platformFilter !== 'all') {
        params.append('platform', platformFilter);
      }

      if (dateRange?.from) {
        params.append('dateFrom', dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        params.append('dateTo', dateRange.to.toISOString());
      }

      const result = await apiCall(`/upload-history/export?${params.toString()}`);
      const data = result.uploads || [];

      // Convert to CSV
      const headers = ['Upload Date', 'Platform', 'File Name', 'Rows Processed', 'Status'];
      const csvContent = [
        headers.join(','),
        ...data.map((record: UploadRecord) => [
          new Date(record.upload_date).toLocaleString(),
          record.platform,
          `"${record.file_name}"`,
          record.rows_processed || 0,
          record.status
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upload-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Upload history exported to CSV'
      });
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [user, searchTerm, platformFilter, dateRange, page]);

  useEffect(() => {
    fetchSummaryStats();
  }, [user]);

  return {
    uploads,
    loading,
    totalCount,
    summaryStats,
    fetchUploads,
    deleteUpload,
    reprocessUpload,
    exportToCSV
  };
};

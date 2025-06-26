
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Upload, CheckCircle, Activity } from "lucide-react";

interface SummaryStats {
  totalUploads: number;
  successRate: number;
  totalRowsProcessed: number;
  recentActivity: number;
}

interface UploadSummaryStatsProps {
  stats: SummaryStats;
}

export const UploadSummaryStats = ({ stats }: UploadSummaryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Uploads This Month
          </CardTitle>
          <Upload className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalUploads}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Files uploaded this month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Success Rate
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.successRate}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Successful uploads
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Rows Processed
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalRowsProcessed.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Data rows processed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Recent Activity
          </CardTitle>
          <Activity className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.recentActivity}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Uploads in last 24h
          </p>
        </CardContent>
      </Card>
    </div>
  );
};


import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Search, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { UploadHistoryTable } from "@/components/Reports/UploadHistoryTable";
import { UploadSummaryStats } from "@/components/Reports/UploadSummaryStats";
import { useUploadHistory } from "@/hooks/useUploadHistory";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const {
    uploads,
    loading,
    totalCount,
    summaryStats,
    fetchUploads,
    deleteUpload,
    reprocessUpload,
    exportToCSV
  } = useUploadHistory({
    searchTerm,
    platformFilter,
    dateRange,
    page: currentPage,
    limit: recordsPerPage
  });

  const handleDateRangeSelect = (range: string) => {
    const now = new Date();
    switch (range) {
      case "7days":
        setDateRange({
          from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: now
        });
        break;
      case "30days":
        setDateRange({
          from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        });
        break;
      case "clear":
        setDateRange(undefined);
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPlatformFilter("all");
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / recordsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">View your upload history and generated reports.</p>
        </div>

        {/* Summary Stats */}
        <UploadSummaryStats stats={summaryStats} />

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Search Files
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by file name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Platform
                </label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDateRangeSelect("7days")}
                          >
                            Last 7 days
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDateRangeSelect("30days")}
                          >
                            Last 30 days
                          </Button>
                        </div>
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>

              {/* Export */}
              <Button
                onClick={() => exportToCSV()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload History Table */}
        <UploadHistoryTable
          uploads={uploads}
          loading={loading}
          onDelete={deleteUpload}
          onReprocess={reprocessUpload}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;

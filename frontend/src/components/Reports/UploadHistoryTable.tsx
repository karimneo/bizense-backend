import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  RotateCcw, 
  Trash2, 
  Download, 
  Facebook, 
  Youtube, 
  Search,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react";
import { format } from "date-fns";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UploadRecord {
  id: number;
  file_name: string;
  platform: string;
  upload_date: string;
  rows_processed: number;
  status: string;
}

interface UploadHistoryTableProps {
  uploads: UploadRecord[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onReprocess: (id: number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const getPlatformIcon = (platform: string) => {
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

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>;
    case 'processing':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Processing</Badge>;
    case 'failed':
    case 'error':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const UploadHistoryTable = ({
  uploads,
  loading,
  onDelete,
  onReprocess,
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: UploadHistoryTableProps) => {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading uploads...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No uploads found</p>
            <p className="text-sm">Try adjusting your filters or upload your first CSV file.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
          Upload History ({totalCount} records)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-600 dark:text-gray-300">Upload Date</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">Platform</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">File Name</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">Rows Processed</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">Status</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id} className="border-gray-200 dark:border-gray-700">
                <TableCell className="text-gray-900 dark:text-white">
                  {format(new Date(upload.upload_date), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(upload.platform)}
                    <span className="text-gray-900 dark:text-white capitalize">
                      {upload.platform}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white max-w-xs truncate">
                  {upload.file_name}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {upload.rows_processed?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  {getStatusBadge(upload.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {upload.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReprocess(upload.id)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">
                            Delete Upload Record
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this upload record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(upload.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

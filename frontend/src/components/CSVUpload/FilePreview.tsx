
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  file: File;
  data: string[][];
  onRemove: () => void;
}

export const FilePreview = ({ file, data, onRemove }: FilePreviewProps) => {
  const headers = data[0] || [];
  const rows = data.slice(1, 6); // Show first 5 rows
  const totalRows = data.length - 1;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>File Preview</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-400">
          <p>{file.name} • {(file.size / 1024).toFixed(1)} KB • {totalRows} rows</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                {headers.map((header, index) => (
                  <TableHead key={index} className="text-gray-300 font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-gray-700">
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-gray-300">
                      {cell || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalRows > 5 && (
          <p className="text-sm text-gray-400 mt-2">
            Showing first 5 rows of {totalRows} total rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};

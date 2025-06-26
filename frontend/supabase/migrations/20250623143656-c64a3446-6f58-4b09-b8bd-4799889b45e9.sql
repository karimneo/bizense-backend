
-- Create a storage bucket for CSV uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-uploads', 'csv-uploads', false);

-- Create RLS policies for the csv-uploads bucket
CREATE POLICY "Users can upload their own CSV files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'csv-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own CSV files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'csv-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own CSV files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'csv-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policies for upload_history table
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own upload history" ON upload_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own upload history" ON upload_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for campaign_reports table
ALTER TABLE campaign_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaign reports" ON campaign_reports
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign reports" ON campaign_reports
FOR INSERT WITH CHECK (auth.uid() = user_id);

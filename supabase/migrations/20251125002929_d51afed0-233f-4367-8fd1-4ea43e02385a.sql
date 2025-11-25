-- Enable INSERT for tracks table for authenticated users
CREATE POLICY "Users can upload tracks"
ON public.tracks
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);
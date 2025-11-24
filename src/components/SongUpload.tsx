import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const SongUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!title || !artist) {
      toast.error('Please enter title and artist name');
      return;
    }

    try {
      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('songs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('songs')
        .getPublicUrl(fileName);

      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });

      const duration = Math.floor(audio.duration);

      // Insert track into database
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          title,
          artist_name: artist,
          audio_url: publicUrl,
          duration,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success('Song uploaded successfully!');
      setTitle('');
      setArtist('');
      event.target.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-border/50 shadow-lg">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Upload Your Song</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            disabled={uploading}
          />
        </div>
        
        <div>
          <Label htmlFor="artist">Artist</Label>
          <Input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist name"
            disabled={uploading}
          />
        </div>

        <div>
          <Label htmlFor="audio">Audio File (Max 10MB)</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
};
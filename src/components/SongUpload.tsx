import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon, Music } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const SongUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!user) return;

    // 1. Validation
    if (!title || !artist) {
      toast.error('Please enter title and artist name');
      return;
    }
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      setUploading(true);

      // 2. Upload Audio
      const audioExt = audioFile.name.split('.').pop();
      const audioFileName = `${user.id}/${Date.now()}.${audioExt}`;
      
      const { error: audioUploadError } = await supabase.storage
        .from('songs') // Ensure this bucket exists
        .upload(audioFileName, audioFile);

      if (audioUploadError) throw audioUploadError;

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('songs')
        .getPublicUrl(audioFileName);

      // 3. Upload Image (Optional but recommended)
      let imageUrl = null;
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imageFileName = `${user.id}/${Date.now()}-cover.${imageExt}`;

        const { error: imageUploadError } = await supabase.storage
          .from('images') // Ensure this bucket exists and is Public
          .upload(imageFileName, imageFile);

        if (imageUploadError) throw imageUploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(imageFileName);
          
        imageUrl = publicUrl;
      }

      // 4. Calculate Duration
      const audioObj = new Audio();
      audioObj.src = URL.createObjectURL(audioFile);
      await new Promise((resolve) => {
        audioObj.addEventListener('loadedmetadata', resolve);
      });
      const duration = Math.floor(audioObj.duration);

      // 5. Insert into Database
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          title,
          artist_name: artist,
          audio_url: audioUrl,
          image_url: imageUrl, // Saving the cover art URL
          duration,
          user_id: user.id, // Changed from 'uploaded_by' to match Discover page logic
        });

      if (insertError) throw insertError;

      toast.success('Song uploaded successfully!');
      
      // Redirect
      setTimeout(() => {
        navigate('/library');
      }, 500);

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
      
      <div className="space-y-4">
        {/* Title Input */}
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
        
        {/* Artist Input */}
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

        {/* Audio File Input */}
        <div>
          <Label htmlFor="audio">Audio File (Max 10MB)</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                        toast.error("File too large");
                        return;
                    }
                    setAudioFile(file);
                }
              }}
              disabled={uploading}
              className="cursor-pointer"
            />
            {audioFile && <Music className="w-4 h-4 text-green-500" />}
          </div>
        </div>

        {/* Cover Art Input */}
        <div>
          <Label htmlFor="image">Cover Art (Optional)</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              disabled={uploading}
              className="cursor-pointer"
            />
            {imageFile && <ImageIcon className="w-4 h-4 text-green-500" />}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleUpload} 
        disabled={uploading || !audioFile || !title || !artist}
        className="w-full mt-4"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          "Upload Song"
        )}
      </Button>
    </div>
  );
};

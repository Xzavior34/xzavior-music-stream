import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon, Music, CheckCircle2 } from "lucide-react";
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

  // 1. Handle Audio Selection (Does NOT upload yet)
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('File must be an audio file');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast.error('Audio file must be less than 15MB');
        return;
      }
      setAudioFile(file);
      toast.success("Audio file selected");
    }
  };

  // 2. Handle Image Selection (Does NOT upload yet)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }
      setImageFile(file);
      toast.success("Cover art selected");
    }
  };

  // 3. The Main Upload Logic (Triggered by button)
  const handleUpload = async () => {
    if (!user) return;

    // Validation
    if (!title.trim() || !artist.trim()) {
      toast.error('Please enter title and artist name');
      return;
    }
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      setUploading(true);
      const timestamp = Date.now();

      // --- A. Upload Audio ---
      const audioExt = audioFile.name.split('.').pop();
      const audioFileName = `${user.id}/${timestamp}.${audioExt}`;
      
      const { error: audioError } = await supabase.storage
        .from('songs') // Ensure 'songs' bucket exists
        .upload(audioFileName, audioFile);

      if (audioError) throw audioError;

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('songs')
        .getPublicUrl(audioFileName);

      // --- B. Upload Image (If selected) ---
      let imageUrl = null;
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imageFileName = `${user.id}/${timestamp}-cover.${imageExt}`;

        const { error: imageError } = await supabase.storage
          .from('images') // Ensure 'images' bucket exists
          .upload(imageFileName, imageFile);

        if (imageError) throw imageError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(imageFileName);
          
        imageUrl = publicUrl;
      }

      // --- C. Get Duration ---
      const audioObj = new Audio();
      audioObj.src = URL.createObjectURL(audioFile);
      await new Promise((resolve) => {
        audioObj.addEventListener('loadedmetadata', resolve);
      });
      const duration = Math.floor(audioObj.duration);

      // --- D. Save to Database ---
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          title: title,
          artist_name: artist,
          audio_url: audioUrl,
          image_url: imageUrl,
          duration: duration,
          user_id: user.id, // Using user_id to match your schema
        });

      if (insertError) throw insertError;

      toast.success('Song uploaded successfully!');
      
      // Cleanup
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setImageFile(null);
      
      // Redirect to Library
      setTimeout(() => {
        navigate('/library');
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 p-6 bg-card rounded-xl border border-border/50 shadow-lg">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <div className="p-2 bg-primary/10 rounded-full">
            <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-xl font-bold">Upload Music</h3>
            <p className="text-sm text-muted-foreground">Share your sound with the world</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Title & Artist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="title">Song Title</Label>
            <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Vibes"
                disabled={uploading}
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="artist">Artist Name</Label>
            <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. The Weeknd"
                disabled={uploading}
            />
            </div>
        </div>

        <div className="h-px bg-border/50 my-2" />

        {/* Audio File Selection */}
        <div className="space-y-2">
          <Label htmlFor="audio" className="flex items-center gap-2">
            Audio File <span className="text-xs text-muted-foreground">(Required)</span>
          </Label>
          <div className="relative">
            <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                disabled={uploading}
                className="cursor-pointer pl-10"
            />
            <Music className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            {audioFile && (
                <div className="absolute right-3 top-3 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
            )}
          </div>
          {audioFile && <p className="text-xs text-green-500">Selected: {audioFile.name}</p>}
        </div>

        {/* Image File Selection */}
        <div className="space-y-2">
          <Label htmlFor="image" className="flex items-center gap-2">
            Cover Art <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <div className="relative">
            <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploading}
                className="cursor-pointer pl-10"
            />
            <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
             {imageFile && (
                <div className="absolute right-3 top-3 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
            )}
          </div>
          {imageFile && <p className="text-xs text-green-500">Selected: {imageFile.name}</p>}
        </div>
      </div>

      {/* FINAL SUBMIT BUTTON */}
      <Button 
        onClick={handleUpload} 
        disabled={uploading || !audioFile || !title || !artist}
        className="w-full mt-6 py-6 text-lg font-semibold"
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Uploading & Saving...
          </>
        ) : (
          "Upload Song"
        )}
      </Button>
    </div>
  );
};

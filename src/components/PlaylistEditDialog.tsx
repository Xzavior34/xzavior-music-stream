import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface PlaylistEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
  };
  onUpdate: () => void;
}

export function PlaylistEditDialog({ open, onOpenChange, playlist, onUpdate }: PlaylistEditDialogProps) {
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(playlist.image_url);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = playlist.image_url;

      // Upload new image if selected
      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${playlist.id}-${Date.now()}.${fileExt}`;
        const filePath = `playlist-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
        setUploading(false);
      }

      // Update playlist
      const { error } = await supabase
        .from('playlists')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', playlist.id);

      if (error) throw error;

      toast.success('Playlist updated successfully!');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating playlist:', error);
      toast.error(error.message || 'Failed to update playlist');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading || saving}
                />
                <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Playlist Name</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Playlist"
              disabled={saving || uploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              disabled={saving || uploading}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || uploading || !title.trim()}
            className="w-full"
          >
            {uploading || saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

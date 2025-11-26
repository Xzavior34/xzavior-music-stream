import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Collaborator {
  id: string;
  user_id: string;
  can_edit: boolean;
  profiles?: {
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface PlaylistCollaboratorsProps {
  playlistId: string;
  isOwner: boolean;
}

export const PlaylistCollaborators = ({ playlistId, isOwner }: PlaylistCollaboratorsProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open, playlistId]);

  useEffect(() => {
    // Real-time subscription for collaborators
    const channel = supabase
      .channel(`playlist-collaborators-${playlistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlist_collaborators',
          filter: `playlist_id=eq.${playlistId}`,
        },
        () => {
          fetchCollaborators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playlistId]);

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('playlist_collaborators')
        .select(`
          id,
          user_id,
          can_edit
        `)
        .eq('playlist_id', playlistId);

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(c => c.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, email, avatar_url')
          .in('id', userIds);
        
        const collabsWithProfiles = data.map(collab => ({
          ...collab,
          profiles: profilesData?.find(p => p.id === collab.user_id) || null,
        }));
        
        setCollaborators(collabsWithProfiles as any);
      } else {
        setCollaborators([]);
      }
    } catch (error: any) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const addCollaborator = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (profileError || !profiles) {
        toast.error('User not found with this email');
        return;
      }

      // Add collaborator
      const { error } = await supabase
        .from('playlist_collaborators')
        .insert({
          playlist_id: playlistId,
          user_id: profiles.id,
          added_by: user?.id,
          can_edit: true,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('User is already a collaborator');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Collaborator added successfully');
      setEmail('');
      fetchCollaborators();
    } catch (error: any) {
      console.error('Error adding collaborator:', error);
      toast.error(error.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast.success('Collaborator removed');
      fetchCollaborators();
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Collaborators
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add collaborator */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
            />
            <Button onClick={addCollaborator} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </div>

          {/* List collaborators */}
          <div className="space-y-2">
            {collaborators.length > 0 ? (
              collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    {collab.profiles?.avatar_url ? (
                      <img
                        src={collab.profiles.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {collab.profiles?.username || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collab.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaborator(collab.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators yet. Add someone to collaborate!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
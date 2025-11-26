import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const songId = pathParts[pathParts.length - 1];

    if (!songId) {
      return new Response(
        JSON.stringify({ error: 'Song ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to fetch from tracks table (uploaded songs)
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('id, title, artist_name, audio_url, duration, image_url, album_id')
      .eq('id', songId)
      .single();

    if (track) {
      return new Response(
        JSON.stringify({
          id: track.id,
          title: track.title,
          artist: track.artist_name,
          audioUrl: track.audio_url,
          duration: track.duration,
          imageUrl: track.image_url,
          albumId: track.album_id,
          source: 'uploaded',
          shareUrl: `${url.origin}?track=${track.id}`,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try external tracks table
    const { data: externalTrack, error: externalError } = await supabase
      .from('external_tracks')
      .select('id, title, artist_name, preview_url, duration, image_url, source, album_name')
      .eq('id', songId)
      .single();

    if (externalTrack) {
      return new Response(
        JSON.stringify({
          id: externalTrack.id,
          title: externalTrack.title,
          artist: externalTrack.artist_name,
          audioUrl: externalTrack.preview_url,
          duration: externalTrack.duration,
          imageUrl: externalTrack.image_url,
          albumName: externalTrack.album_name,
          source: externalTrack.source,
          isPreview: true,
          shareUrl: `${url.origin}?track=${externalTrack.id}`,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Song not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching song:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

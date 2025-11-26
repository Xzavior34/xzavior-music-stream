import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Fetching user data for recommendations...');

    // Get user's liked tracks
    const { data: likedTracks, error: likedError } = await supabase
      .from('liked_tracks')
      .select(`
        track:tracks (
          title,
          artist_name,
          duration
        )
      `)
      .eq('user_id', user.id)
      .limit(20);

    if (likedError) {
      console.error('Error fetching liked tracks:', likedError);
      throw likedError;
    }

    // Get listening history
    const { data: history, error: historyError } = await supabase
      .from('listening_history')
      .select(`
        track:tracks (
          title,
          artist_name,
          duration
        )
      `)
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(30);

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    console.log(`Found ${likedTracks?.length || 0} liked tracks and ${history?.length || 0} history items`);

    // Prepare data for AI
    const likedSongs = likedTracks?.map(lt => lt.track).filter(Boolean) || [];
    const recentlyPlayed = history?.map(h => h.track).filter(Boolean) || [];

    if (likedSongs.length === 0 && recentlyPlayed.length === 0) {
      return new Response(
        JSON.stringify({ 
          recommendations: [],
          message: "Start liking songs to get personalized recommendations!" 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI for song recommendations
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a music recommendation expert. Analyze user listening patterns and return ONLY song titles and artists they would enjoy. Return a simple JSON array with objects containing: artist (exact artist name), title (exact song name). No explanations, just 8 songs.'
          },
          {
            role: 'user',
            content: `Based on this user's music taste:\n\nLiked songs: ${JSON.stringify(likedSongs.slice(0, 15))}\n\nRecently played: ${JSON.stringify(recentlyPlayed.slice(0, 15))}\n\nRecommend 8 specific real songs that match their taste. Return artist and title only.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse AI recommendations
    let aiSuggestions = [];
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      aiSuggestions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(
        JSON.stringify({ recommendations: [] }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching actual tracks from Deezer...');
    
    // Fetch actual tracks from Deezer API
    const recommendations = [];
    for (const suggestion of aiSuggestions.slice(0, 8)) {
      try {
        const searchQuery = `${suggestion.artist} ${suggestion.title}`;
        const deezerResponse = await fetch(
          `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`
        );
        
        if (deezerResponse.ok) {
          const deezerData = await deezerResponse.json();
          if (deezerData.data && deezerData.data.length > 0) {
            const track = deezerData.data[0];
            recommendations.push({
              id: track.id.toString(),
              title: track.title,
              artist: track.artist.name,
              image_url: track.album.cover_medium,
              preview_url: track.preview,
              duration: track.duration,
              album: track.album.title,
            });
          }
        }
      } catch (e) {
        console.error('Error fetching track:', e);
      }
    }

    console.log(`Returning ${recommendations.length} actual tracks`);

    return new Response(
      JSON.stringify({ recommendations }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
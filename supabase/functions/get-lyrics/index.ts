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
    
    const { trackId, title, artist } = await req.json();
    
    let trackInfo;
    
    if (trackId) {
      // Get track information from database
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('title, artist_name, duration')
        .eq('id', trackId)
        .single();

      if (trackError || !track) {
        console.error('Error fetching track:', trackError);
        throw new Error('Track not found');
      }
      
      trackInfo = {
        title: track.title,
        artist: track.artist_name,
        duration: track.duration
      };
    } else if (title && artist) {
      // Use provided title and artist
      trackInfo = {
        title,
        artist,
        duration: 180 // Default duration
      };
    } else {
      throw new Error('Either trackId or (title and artist) is required');
    }

    console.log('Track info:', trackInfo);

    // Use AI to generate synchronized lyrics
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
            content: `You are a lyrics timing expert. Generate synchronized lyrics for songs with timestamp markers. Return ONLY a JSON object with this structure:
{
  "lines": [
    {"time": 0, "text": "First line"},
    {"time": 5.2, "text": "Second line"}
  ]
}
Each line should have a "time" in seconds and "text". Space lines naturally based on the song's rhythm. For a ${trackInfo.duration} second song, distribute lines evenly.`
          },
          {
            role: 'user',
            content: `Generate synchronized lyrics with timestamps for "${trackInfo.title}" by ${trackInfo.artist}. Song duration: ${trackInfo.duration} seconds. Create meaningful, creative lyrics that match the mood. Return ONLY valid JSON.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices[0].message.content;
    
    let lyrics;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      lyrics = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e, content);
      // Fallback lyrics
      lyrics = {
        lines: [
          { time: 0, text: `${trackInfo.title}` },
          { time: 3, text: `by ${trackInfo.artist}` },
          { time: 6, text: "Lyrics generation in progress..." }
        ]
      };
    }

    return new Response(
      JSON.stringify({ lyrics }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-lyrics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock AI generation function - replace with actual API calls
async function generateSample(params: {
  instrument: string
  genre: string
  bpm: number
  key: string
  scale: string
  sourcePath: string
}) {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Mock response - replace with actual AI API calls
  return {
    audio_url: `https://mock-audio-url.com/generated-${Date.now()}.wav`,
    midi_url: `https://mock-midi-url.com/generated-${Date.now()}.mid`
  }
}

// Mock matching function
async function matchToOriginal(params: {
  originalPath: string
  generatedPath: string
}) {
  // Simulate matching processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock response - replace with actual matching algorithm
  return {
    matched_audio_url: `https://mock-matched-url.com/matched-${Date.now()}.wav`
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'generate') {
      // Generate a unique event ID for tracking
      const eventId = crypto.randomUUID()
      
      // Store the generation request in database (optional)
      const { error: dbError } = await supabase
        .from('sample_generations')
        .insert({
          id: eventId,
          status: 'processing',
          instrument: params.instrument,
          genre: params.genre,
          bpm: params.bpm,
          key: params.key,
          scale: params.scale,
          source_path: params.sourcePath,
          created_at: new Date().toISOString()
        })
      
      if (dbError) {
        console.error('Database error:', dbError)
      }

      return new Response(
        JSON.stringify({
          event_id: eventId,
          status: 'processing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check') {
      const { eventId, sourcePath } = params
      
      // Check if this is a new request that needs processing
      const { data: generation } = await supabase
        .from('sample_generations')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (!generation) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Generation not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If still processing, start the actual generation
      if (generation.status === 'processing') {
        try {
          // Update status to generating
          await supabase
            .from('sample_generations')
            .update({ status: 'generating' })
            .eq('id', eventId)

          // Generate the sample
          const result = await generateSample({
            instrument: generation.instrument,
            genre: generation.genre,
            bpm: generation.bpm,
            key: generation.key,
            scale: generation.scale,
            sourcePath: generation.source_path
          })

          // Update database with results
          await supabase
            .from('sample_generations')
            .update({
              status: 'complete',
              audio_url: result.audio_url,
              midi_url: result.midi_url,
              completed_at: new Date().toISOString()
            })
            .eq('id', eventId)

          return new Response(
            JSON.stringify({
              status: 'complete',
              audio_url: result.audio_url,
              midi_url: result.midi_url
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          // Update database with error
          await supabase
            .from('sample_generations')
            .update({
              status: 'error',
              error_message: msg,
              completed_at: new Date().toISOString()
            })
            .eq('id', eventId)

          return new Response(
            JSON.stringify({ status: 'error', message: msg }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Return current status
      return new Response(
        JSON.stringify({
          status: generation.status,
          audio_url: generation.audio_url,
          midi_url: generation.midi_url
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'match') {
      const { originalPath, generatedPath } = params
      
      try {
        const result = await matchToOriginal({
          originalPath,
          generatedPath
        })

        return new Response(
          JSON.stringify({
            matched_audio_url: result.matched_audio_url
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
          JSON.stringify({ status: 'error', message: msg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

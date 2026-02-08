
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt, duration } = await req.json()

        // Hugging Face Inference API URL for MusicGen Melody
        const API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-melody";
        const API_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");

        if (!API_TOKEN) {
            throw new Error("Missing HUGGING_FACE_ACCESS_TOKEN secret.");
        }

        // Prepare inputs for Hugging Face
        // Note: The free Inference API primarily supports Text-to-Music for this model.
        // Complex audio-conditioned input (melody) is often limited or requires specific payload formatting usually reserved for the full pipeline.
        // We will proceed with Text-based generation which is reliable on the free tier.

        const payload = {
            inputs: prompt,
            // parameters: { duration: duration } // HF API parameters vary, often fixed duration on free tier
        };

        console.log("Calling Hugging Face API with prompt:", prompt);

        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF API Error:", errorText);
            throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // The response is binary audio data (Blob/Buffer)
        const audioBuffer = await response.arrayBuffer();

        // Convert to Base64 to send back to client in JSON
        const base64Audio = btoa(
            new Uint8Array(audioBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Determine content type (usually FLAC or WAV from HF)
        const contentType = response.headers.get("content-type") || "audio/flac";
        const dataUri = `data:${contentType};base64,${base64Audio}`;

        return new Response(JSON.stringify({ output: dataUri }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

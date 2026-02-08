
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
        const { prompt, melody, duration, model_version } = await req.json()

        // Default to a popular MusicGen model (MusicGen Melody)
        // specific version hash for: facebookresearch/musicgen:7a76a8258b23fae65c5a22debb8841dcc7aa2fb7986431d21b650b771b90c6ac
        // This is "melody" version. 
        // "large" version: 671ac645ce5e552cc63a54a2bb95b55d6595799fa6c7fb442f9e548231c3606c
        const version = model_version || "7a76a8258b23fae65c5a22debb8841dcc7aa2fb7986431d21b650b771b90c6ac";

        const input = {
            prompt: prompt,
            model_version: "melody",
            duration: duration || 15,
            continue: 0 // generated audio does not continue the melody but uses it as detailed conditioning
        };

        if (melody) {
            input.melody = melody;
        }

        // Call Replicate API to create a prediction
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: version,
                input: input,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to create prediction");
        }

        const prediction = await response.json();
        let result = prediction;

        // Poll for completion
        // Note: Edge Functions have a timeout (usually 60s for free tier, longer for pro). 
        // MusicGen 15s might take 30-60s. We'll poll for a bit.

        const maxAttempts = 60; // 60 seconds roughly
        let attempts = 0;

        while (
            result.status !== "succeeded" &&
            result.status !== "failed" &&
            result.status !== "canceled" &&
            attempts < maxAttempts
        ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;

            const pollResponse = await fetch(result.urls.get, {
                headers: {
                    Authorization: `Token ${Deno.env.get("REPLICATE_API_TOKEN")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!pollResponse.ok) {
                // If polling fails, we might just return the ID and let client handle it, but for now throw
                console.error("Polling failed");
                break;
            }

            result = await pollResponse.json();
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

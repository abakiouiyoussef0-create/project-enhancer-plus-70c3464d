import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const formData = await req.formData()
        const referenceFiles = formData.getAll('references') as File[]
        const sourceFile = formData.get('source') as File
        const pitch = formData.get('pitch') || '0'
        const strength = formData.get('strength') || '1'

        if (!sourceFile || referenceFiles.length === 0) {
            return new Response(JSON.stringify({ error: 'Missing files' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')

        // For RVC, we usually need an RVC model or a space that can handle reference audio
        // We will use a popular RVC Space API (e.g., Applio or specialized RVC space)
        // For this example, we'll use a placeholder URL and logic to show how it connects
        const SPACE_URL = "https://ijge-applio-rvc-fork.hf.space/run/predict" // Example RVC Space

        // 1. Prepare data for Hugging Face Gradio API
        // Gradio usually expects a JSON with "data": [arg1, arg2, ...]
        const rvcPayload = {
            data: [
                await sourceFile.arrayBuffer().then(buf => b64encode(buf)), // Input vocal
                await referenceFiles[0].arrayBuffer().then(buf => b64encode(buf)), // Reference vocal
                parseInt(pitch as string), // Pitch
                parseFloat(strength as string), // Strength
                "pm", // F0 Method (pm, harvest, crepe, etc.)
                0.75, // Search ratio
                3, // Filter radius
                0, // Resample
                0.25, // Volume envelope
                0.33, // Protect pitch
            ],
            fn_index: 0, // This depends on the specific Space's function index
        }

        console.log("Calling Hugging Face RVC Space...")

        const response = await fetch(SPACE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rvcPayload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HF API Error: ${errorText}`)
        }

        const result = await response.json()
        // result.data[0] usually contains the base64 or URL of the converted audio

        return new Response(JSON.stringify({ result: result.data[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

function b64encode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return `data:audio/wav;base64,${btoa(binary)}`
}

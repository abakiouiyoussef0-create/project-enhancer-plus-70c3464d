import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { sourcePath, refPath, pitch, strength } = await req.json()

        if (!sourcePath || !refPath) {
            return new Response(JSON.stringify({ error: 'Missing file paths' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
        if (!HF_TOKEN) {
            throw new Error('Missing Hugging Face Token in Supabase Secrets')
        }

        console.log(`Processing: ${sourcePath}`)

        // 1. Download Source File
        const { data: sourceData, error: sourceError } = await supabase.storage
            .from('vocals')
            .download(sourcePath)
        if (sourceError) throw sourceError

        // 2. Download Reference File
        const { data: refData, error: refError } = await supabase.storage
            .from('vocals')
            .download(refPath)
        if (refError) throw refError

        // 3. Convert to Base64 (Using fast native Deno utility)
        const sourceUint8 = new Uint8Array(await sourceData.arrayBuffer())
        const refUint8 = new Uint8Array(await refData.arrayBuffer())

        const sourceB64 = `data:audio/wav;base64,${encode(sourceUint8)}`
        const refB64 = `data:audio/wav;base64,${encode(refUint8)}`

        // Using a MORE STABLE RVC Space URL
        const SPACE_URL = "https://ijge-applio-rvc-fork.hf.space/run/predict"

        const rvcPayload = {
            data: [
                sourceB64,       // Target audio (Source)
                refB64,          // Reference audio (RK)
                parseInt(pitch as string) || 0, // Pitch shift
                "rmvpe",         // F0 method
                0.75,            // Index rate
                parseFloat(strength as string) || 0.75, // Volume envelope
                3,               // Filter radius
                0,               // Resample
                0.25,            // RMS mix
                0.33,            // Protect pitch
            ],
            fn_index: 0
        }

        console.log("Calling Hugging Face...")

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
            console.error("HF Error:", errorText)
            return new Response(JSON.stringify({ error: `AI Model Error: ${errorText.substring(0, 50)}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status,
            })
        }

        const result = await response.json()

        // Cleanup temp files
        await supabase.storage.from('vocals').remove([sourcePath, refPath])

        return new Response(JSON.stringify({ result: result.data[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Edge Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

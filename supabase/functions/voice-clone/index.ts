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
        const body = await req.json()
        const { action, sourcePath, refPath, pitch, strength, eventId } = body

        const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
        const SPACE_URL = "https://ijge-applio-rvc-fork.hf.space"

        if (!HF_TOKEN) throw new Error('Missing Hugging Face Token')

        // MODE 1: START CONVERSION
        if (action === "start") {
            const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
            const supabase = createClient(supabaseUrl, supabaseKey)

            console.log(`Starting Async Call for: ${sourcePath}`)

            // Download files
            const [sourceRes, refRes] = await Promise.all([
                supabase.storage.from('vocals').download(sourcePath),
                supabase.storage.from('vocals').download(refPath)
            ])

            if (sourceRes.error || refRes.error) throw new Error("Storage download failed")

            // Encode
            const sourceB64 = `data:audio/wav;base64,${encode(new Uint8Array(await sourceRes.data.arrayBuffer()))}`
            const refB64 = `data:audio/wav;base64,${encode(new Uint8Array(await refRes.data.arrayBuffer()))}`

            // Initiate Gradio call
            const initiateResponse = await fetch(`${SPACE_URL}/gradio_api/call/predict`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: [
                        sourceB64,
                        refB64,
                        parseInt(pitch as string) || 0,
                        "rmvpe",
                        0.75,
                        parseFloat(strength as string) || 0.75,
                        3,
                        0,
                        0.25,
                        0.33,
                    ],
                    fn_index: 0
                }),
            })

            if (!initiateResponse.ok) throw new Error(await initiateResponse.text())
            const { event_id } = await initiateResponse.json()

            return new Response(JSON.stringify({ event_id }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // MODE 2: CHECK STATUS (POLLING)
        if (action === "check" && eventId) {
            console.log(`Polling status for event: ${eventId}`)
            const pollResponse = await fetch(`${SPACE_URL}/gradio_api/call/predict/${eventId}`, {
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            })

            if (!pollResponse.ok) throw new Error("Gradio polling failed")

            const text = await pollResponse.text()

            // Check if conversion is done
            if (text.includes('event: complete')) {
                const matches = text.match(/data: (\[.*?\])/)
                if (matches && matches[1]) {
                    const data = JSON.parse(matches[1])
                    let resultUrl = data[0]
                    if (resultUrl && !resultUrl.startsWith('http')) {
                        resultUrl = `${SPACE_URL}/file=${resultUrl}`
                    }
                    return new Response(JSON.stringify({ status: "complete", result: resultUrl }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200,
                    })
                }
            }

            if (text.includes('event: error')) {
                throw new Error("AI Model reported an internal error")
            }

            return new Response(JSON.stringify({ status: "processing" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        throw new Error("Invalid action or missing parameters")

    } catch (error) {
        console.error("Async Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

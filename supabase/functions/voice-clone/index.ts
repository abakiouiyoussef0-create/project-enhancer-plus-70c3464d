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
        const body = await req.json()
        const { action, sourcePath, refPath, pitch, strength, eventId } = body

        const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
        const SPACE_URL = "https://ijge-applio-rvc-fork.hf.space"

        if (!HF_TOKEN) throw new Error('Missing Hugging Face Token')

        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // MODE 1: START CONVERSION
        if (action === "start") {
            console.log(`Checking files: ${sourcePath}, ${refPath}`)

            // Instead of downloading, generate Signed URLs (valid for 10 minutes)
            // This is ZERO-MEMORY because we only send the link!
            const [sourceSigned, refSigned] = await Promise.all([
                supabase.storage.from('vocals').createSignedUrl(sourcePath, 600),
                supabase.storage.from('vocals').createSignedUrl(refPath, 600)
            ])

            if (sourceSigned.error || !sourceSigned.data?.signedUrl) throw new Error(`Signed URL Error: ${sourceSigned.error?.message}`)
            if (refSigned.error || !refSigned.data?.signedUrl) throw new Error(`Signed URL Error: ${refSigned.error?.message}`)

            console.log("URLs generated. Initiating Gradio call...")

            // Initiate Gradio call with URLs
            const initiateResponse = await fetch(`${SPACE_URL}/gradio_api/call/predict`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: [
                        sourceSigned.data.signedUrl, // Pass URL directly
                        refSigned.data.signedUrl,    // Pass URL directly
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

            if (!initiateResponse.ok) {
                const errText = await initiateResponse.text()
                throw new Error(`Init Failed: ${errText}`)
            }

            const { event_id } = await initiateResponse.json()
            return new Response(JSON.stringify({ event_id }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // MODE 2: CHECK STATUS
        if (action === "check" && eventId) {
            const pollResponse = await fetch(`${SPACE_URL}/gradio_api/call/predict/${eventId}`, {
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            })

            if (!pollResponse.ok) throw new Error("Gradio polling failed")

            const text = await pollResponse.text()

            if (text.includes('event: complete')) {
                const matches = text.match(/data: (\[.*?\])/)
                if (matches && matches[1]) {
                    const data = JSON.parse(matches[1])
                    let resultUrl = data[0]
                    if (resultUrl && !resultUrl.startsWith('http')) {
                        resultUrl = `${SPACE_URL}/file=${resultUrl}`
                    }

                    // Only cleanup on completion to save CPU during polling
                    // We don't need to await this
                    supabase.storage.from('vocals').remove([sourcePath, refPath]).then(() => {
                        console.log("Storage cleaned up")
                    }).catch(e => console.error("Cleanup failed:", e))

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

        throw new Error("Invalid request")

    } catch (error) {
        console.error("Internal Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

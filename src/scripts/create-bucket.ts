// Script to create the storage bucket for melodies
// This can be run in the Supabase SQL Editor or via the Supabase client

import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMelodiesBucket() {
    try {
        // Create the bucket
        const { data, error } = await supabase
            .storage
            .createBucket('melodies', {
                public: true,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/wave']
            });

        if (error) {
            console.error('Error creating bucket:', error);
            return;
        }

        console.log('✅ Bucket created successfully:', data);
    } catch (err) {
        console.error('Error:', err);
    }
}

createMelodiesBucket();

// Test file to verify key detection fix
const extractMetadataFromFilename = (filename: string) => {
    const bpmMatch = filename.match(/\b(\d{2,3})\s*(?:bpm)?\b/i);

    // Priority 1: Keys with #, b, maj, major, min, minor, or m modifiers
    let keyMatch = filename.match(/(?:^|[^a-zA-Z])([A-G][#b](?:maj|major|min|minor|m)?|[A-G](?:maj|major|min|minor|m))(?:[^a-zA-Z]|$)/i);

    // Priority 2: Single letter keys ONLY if surrounded by non-letter characters
    if (!keyMatch) {
        keyMatch = filename.match(/(?:^|[^a-zA-Z])([A-G])(?:[^a-zA-Z]|$)/);
    }

    return {
        bpm: bpmMatch ? bpmMatch[1] : null,
        key: keyMatch ? keyMatch[1].trim() : null
    };
};

// Test cases from user
const testCases = [
    "devile 130 BPM F#m.mp3",           // Should get F#m, not d
    "130 bpm devile F",                 // Should get F
    "Cm 156Bpm mrss",                   // Should get Cm
    "loop 140bpm dmin.mp3",             // Should get dmin, not d or l
    "beat_Gm_150.wav",                  // Should get Gm
    "sample_C_major_120bpm.mp3",        // Should get C major
    "devile.mp3",                       // Should get null (no key)
    "Amaj 140 bpm.mp3",                 // Should get Amaj
];

console.log("Testing Key Detection:\n");
testCases.forEach(filename => {
    const result = extractMetadataFromFilename(filename);
    console.log(`"${filename}"`);
    console.log(`  → BPM: ${result.bpm || 'N/A'}, Key: ${result.key || 'N/A'}\n`);
});

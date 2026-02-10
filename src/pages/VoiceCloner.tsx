import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Mic2, Upload, Play, Pause, Save, RefreshCw, Zap, Volume2, Music2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


export default function VoiceCloner() {
    const [isCloning, setIsCloning] = useState(false);
    const [cloningStatus, setCloningStatus] = useState<string>("");
    const [pitch, setPitch] = useState(0);
    const [strength, setStrength] = useState(1);
    const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);

    const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setReferenceFiles(prev => [...prev, ...files].slice(0, 3));
            toast.success(`${files.length} reference file(s) added.`);
        }
    };

    const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSourceFile(e.target.files[0]);
            toast.success("Source vocal uploaded.");
        }
    };

    const startCloning = async () => {
        if (referenceFiles.length === 0) {
            toast.error("Please upload at least one reference vocal.");
            return;
        }
        if (!sourceFile) {
            toast.error("Please upload your source vocal.");
            return;
        }

        setIsCloning(true);
        setCloningStatus("Preparing...");
        setClonedAudioUrl(null);

        try {
            // 1. Upload Source File to Supabase Storage
            setCloningStatus("Uploading vocal...");
            const sourcePath = `${crypto.randomUUID()}_${sourceFile.name}`;
            const { error: sourceError } = await supabase.storage
                .from('vocals')
                .upload(sourcePath, sourceFile);

            if (sourceError) throw sourceError;

            // 2. Upload Reference File (Only the first one to keep it fast)
            setCloningStatus("Uploading reference...");
            const refFile = referenceFiles[0];
            const refPath = `${crypto.randomUUID()}_${refFile.name}`;
            const { error: refError } = await supabase.storage
                .from('vocals')
                .upload(refPath, refFile);

            if (refError) throw refError;

            // 3. Initiate conversion (Action: START)
            setCloningStatus("AI Processing...");
            const { data: startData, error: startError } = await supabase.functions.invoke('voice-clone', {
                body: {
                    action: "start",
                    sourcePath,
                    refPath,
                    pitch: pitch.toString(),
                    strength: strength.toString()
                },
            });

            if (startError) throw startError;
            if (!startData?.event_id) throw new Error("Failed to start AI process");

            // 4. Polling for result (Action: CHECK)
            let isComplete = false;
            let resultUrl = "";
            let attempts = 0;
            const maxAttempts = 60; // 2 minutes

            while (!isComplete && attempts < maxAttempts) {
                setCloningStatus(`Processing... (${Math.round((attempts / maxAttempts) * 100)}%)`);

                const { data: pollData, error: pollError } = await supabase.functions.invoke('voice-clone', {
                    body: {
                        action: "check",
                        eventId: startData.event_id,
                        sourcePath,
                        refPath
                    },
                });

                if (pollError) throw pollError;

                if (pollData?.status === "complete") {
                    resultUrl = pollData.result;
                    isComplete = true;
                    break;
                }

                if (pollData?.status === "error") {
                    throw new Error("AI Processing failed");
                }

                // Wait 3 seconds between polls
                await new Promise(r => setTimeout(r, 3000));
                attempts++;
            }

            if (!resultUrl) throw new Error("Conversion timed out");

            setClonedAudioUrl(resultUrl);
            toast.success("Voice cloning complete! ⚡");

        } catch (error) {
            console.error(error);
            toast.error(`Cloning failed: ${error.message || "Please try again."}`);
        } finally {
            setIsCloning(false);
            setCloningStatus("");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col gap-2 relative overflow-hidden rounded-xl p-8 border border-primary/20 bg-gradient-to-r from-background to-primary/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                <motion.h1
                    className="text-5xl font-black tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent relative z-10"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    AI VOICE CLONER
                </motion.h1>
                <motion.p
                    className="text-xl text-muted-foreground relative z-10 max-w-2xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Transform your vocals into any target voice with RVC technology.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Reference & Source Uploads */}
                <div className="xl:col-span-2 space-y-8">
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic2 className="w-6 h-6 text-primary" />
                                Vocal Setup
                            </CardTitle>
                            <CardDescription>Upload the reference voice and your original vocal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Reference Upload */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Reference Voice (RK)</Label>
                                    <div
                                        className="border-2 border-dashed border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-colors bg-background/20 group cursor-pointer relative"
                                        onClick={() => document.getElementById('ref-upload')?.click()}
                                    >
                                        <Upload className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <p className="font-bold">Add Reference Samples</p>
                                            <p className="text-xs text-muted-foreground">Upload 1-3 WAV/MP3 files</p>
                                        </div>
                                        <input
                                            id="ref-upload"
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="audio/*"
                                            onChange={handleReferenceUpload}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {referenceFiles.map((f, i) => (
                                            <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                                {f.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Source Upload */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Your Vocal (Source)</Label>
                                    <div
                                        className="border-2 border-dashed border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-colors bg-background/20 group cursor-pointer relative"
                                        onClick={() => document.getElementById('source-upload')?.click()}
                                    >
                                        <Music2 className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <p className="font-bold">Upload Your Vocal</p>
                                            <p className="text-xs text-muted-foreground">The file to be converted</p>
                                        </div>
                                        <input
                                            id="source-upload"
                                            type="file"
                                            className="hidden"
                                            accept="audio/*"
                                            onChange={handleSourceUpload}
                                        />
                                    </div>
                                    {sourceFile && (
                                        <Badge variant="outline" className="border-purple-400 text-purple-400">
                                            {sourceFile.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-6 h-6 text-yellow-400" />
                                Vocal Shaping
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-sm font-bold">Pitch Shift (Semitones)</Label>
                                        <span className="text-primary font-mono">{pitch > 0 ? `+${pitch}` : pitch}</span>
                                    </div>
                                    <Slider
                                        value={[pitch]}
                                        min={-12}
                                        max={12}
                                        step={1}
                                        onValueChange={(v) => setPitch(v[0])}
                                    />
                                    <p className="text-xs text-muted-foreground italic">Use +12 for Male to Female, -12 for Female to Male.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-sm font-bold">Inference Strength</Label>
                                        <span className="text-primary font-mono">{Math.round(strength * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[strength]}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        onValueChange={(v) => setStrength(v[0])}
                                    />
                                    <p className="text-xs text-muted-foreground italic">Higher values stick closer to the reference voice timbre.</p>
                                </div>
                            </div>

                            <Button
                                className="w-full h-16 text-xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
                                onClick={startCloning}
                                disabled={isCloning}
                            >
                                {isCloning ? (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span>{cloningStatus}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-6 h-6" />
                                        <span>START VOICE CONVERSION</span>
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Result & Preview */}
                <div className="space-y-8">
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Volume2 className="w-6 h-6 text-green-400" />
                                Output Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center gap-6">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                <Mic2 className="w-12 h-12 text-primary relative z-10" />
                            </div>

                            {!clonedAudioUrl ? (
                                <div className="text-center space-y-2">
                                    <p className="text-muted-foreground italic">Wait for conversion...</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    <div className="p-4 rounded-xl bg-background/40 border border-primary/20 flex items-center justify-between">
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                                            <Play className="w-6 h-6 text-primary" />
                                        </Button>
                                        <div className="flex-1 px-4">
                                            <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                                                <div className="h-full w-1/3 bg-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10">
                                            <Save className="w-4 h-4" /> Save
                                        </Button>
                                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10">
                                            <Share2 className="w-4 h-4" /> Share
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

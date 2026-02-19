import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Music2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Pin,
  PinOff,
  Wand2,
  Volume2,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MUSICAL_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const SCALES = [
  'Major', 'Minor', 'Pentatonic', 'Blues', 'Dorian', 'Phrygian', 'Mixolydian'
];

interface GeneratedSample {
  id: string;
  audioUrl: string;
  isPlaying: boolean;
  isPinned: boolean;
  generationNumber: number;
}

export default function AISampleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  
  // Prompt inputs
  const [mainPrompt, setMainPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefinementMode, setIsRefinementMode] = useState(false);
  
  // Music controls
  const [bpm, setBpm] = useState([140]);
  const [musicalKey, setMusicalKey] = useState<string>("G");
  const [scale, setScale] = useState<string>("Minor");
  
  // Generated samples
  const [samples, setSamples] = useState<GeneratedSample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const generateSamples = async () => {
    const prompt = isRefinementMode && selectedSampleId ? refinementPrompt : mainPrompt;
    
    if (!prompt.trim()) {
      toast.error("Please enter a description for the vocal sample.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Initializing AI...");
    setProgress(0);

    try {
      // Build full prompt with music parameters
      const fullPrompt = `${prompt}, ${bpm[0]} BPM, Key: ${musicalKey} ${scale}, no drums, vocal only, ethnic, high quality`;
      
      setGenerationStatus("Generating 4 vocal variations...");
      setProgress(20);

      // Call the edge function to generate 4 samples
      const { data, error } = await supabase.functions.invoke('ai-sample-generator', {
        body: {
          action: "generate_vocals",
          prompt: fullPrompt,
          bpm: bpm[0],
          key: musicalKey,
          scale: scale,
          count: 4,
          previousSampleId: isRefinementMode ? selectedSampleId : null,
          refinementInstructions: isRefinementMode ? refinementPrompt : null
        },
      });

      if (error) throw error;

      setProgress(60);
      setGenerationStatus("Processing audio...");

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        setProgress(Math.min(60 + (attempts / maxAttempts) * 30, 90));
        
        const { data: pollData, error: pollError } = await supabase.functions.invoke('ai-sample-generator', {
          body: {
            action: "check_generation",
            generationId: data.generation_id
          },
        });

        if (pollError) throw pollError;

        if (pollData?.status === "complete") {
          const newGenCount = generationCount + 1;
          setGenerationCount(newGenCount);
          
          const newSamples: GeneratedSample[] = pollData.samples.map((sample: any, index: number) => ({
            id: `${newGenCount}-${index}`,
            audioUrl: sample.audio_url,
            isPlaying: false,
            isPinned: false,
            generationNumber: newGenCount
          }));
          
          setSamples(newSamples);
          setProgress(100);
          toast.success(`Generated 4 vocal samples! Generation #${newGenCount}`);
          
          if (isRefinementMode) {
            setIsRefinementMode(false);
            setRefinementPrompt("");
          }
          break;
        }

        if (pollData?.status === "error") {
          throw new Error(pollData.message || "Generation failed");
        }

        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }

    } catch (error: any) {
      console.error(error);
      toast.error(`Generation failed: ${error.message || "Please try again."}`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
      setProgress(0);
    }
  };

  const pinSample = (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId);
    if (!sample) return;

    if (sample.isPinned) {
      // Unpin
      setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, isPinned: false } : s));
      if (selectedSampleId === sampleId) {
        setSelectedSampleId(null);
      }
      toast.info("Sample unpinned");
    } else {
      // Pin this sample and unpin others
      setSamples(prev => prev.map(s => ({ ...s, isPinned: s.id === sampleId })));
      setSelectedSampleId(sampleId);
      toast.success("Sample pinned! Ready for refinement.");
    }
  };

  const startRefinement = () => {
    if (!selectedSampleId) {
      toast.error("Please pin a sample first to refine it.");
      return;
    }
    setIsRefinementMode(true);
    toast.info("Enter your refinement instructions below and click GENERATE");
  };

  const downloadSample = async (audioUrl: string, sampleId: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `vocal-sample-gen${sampleId}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Sample ${sampleId} downloaded!`);
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 relative overflow-hidden rounded-xl p-8 border border-[#00D4FF]/20 bg-gradient-to-r from-background via-[#0a0a0a] to-[#00D4FF]/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay" />
        <motion.h1
          className="text-5xl font-black tracking-tighter bg-gradient-to-r from-[#00D4FF] via-[#0099CC] to-[#0066FF] bg-clip-text text-transparent relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          PERUNZ AI VOCAL GENERATOR
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground relative z-10 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Generate ethnic vocal samples with AI. Describe what you want, get 4 variations, refine your favorite.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Prompt & Controls */}
        <div className="space-y-8">
          {/* Main Prompt Input */}
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00D4FF]">
                <MessageSquare className="w-6 h-6" />
                {isRefinementMode ? "Refinement Instructions" : "Describe Your Vocal"}
              </CardTitle>
              <CardDescription>
                {isRefinementMode 
                  ? `Refining pinned sample. Example: "Keep first 8 seconds, make it more emotional after"`
                  : "Describe the vocal you want. Example: nordic female melodic ethnic high quality"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder={isRefinementMode 
                  ? "Don't change first 8 seconds, make the female sing more emotionally after that..."
                  : "nordic vocal female melodic high quality without drums"
                }
                value={isRefinementMode ? refinementPrompt : mainPrompt}
                onChange={(e) => isRefinementMode ? setRefinementPrompt(e.target.value) : setMainPrompt(e.target.value)}
                className="min-h-[120px] bg-[#0a0a0a]/60 border-[#00D4FF]/20 text-white placeholder:text-muted-foreground"
              />

              {/* Music Controls */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-bold text-white">BPM</Label>
                    <span className="text-[#00D4FF] font-mono">{bpm[0]}</span>
                  </div>
                  <Slider
                    value={bpm}
                    min={80}
                    max={180}
                    step={1}
                    onValueChange={setBpm}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white">Key</Label>
                  <Select value={musicalKey} onValueChange={setMusicalKey}>
                    <SelectTrigger className="bg-[#0a0a0a]/60 border-[#00D4FF]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#00D4FF]/20">
                      {MUSICAL_KEYS.map((key) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-[#00D4FF]/20">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white">Scale</Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="bg-[#0a0a0a]/60 border-[#00D4FF]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#00D4FF]/20">
                      {SCALES.map((scaleOption) => (
                        <SelectItem key={scaleOption} value={scaleOption} className="text-white hover:bg-[#00D4FF]/20">
                          {scaleOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generation Info Badge */}
              {isRefinementMode && selectedSampleId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                  <Pin className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-sm text-[#00D4FF]">
                    Refining: Generation {selectedSampleId.split('-')[0]}, Sample {parseInt(selectedSampleId.split('-')[1]) + 1}
                  </span>
                </div>
              )}

              {/* Generate Button */}
              <Button
                className="w-full h-16 text-xl font-black bg-gradient-to-r from-[#00D4FF] via-[#0099CC] to-[#0066FF] hover:scale-[1.02] transition-transform shadow-xl shadow-[#00D4FF]/20"
                onClick={generateSamples}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>{generationStatus}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <span>{isRefinementMode ? "REFINE SAMPLE" : "GENERATE 4 SAMPLES"}</span>
                  </div>
                )}
              </Button>

              {progress > 0 && (
                <Progress value={progress} className="h-2 bg-[#0a0a0a]/60 [&_[role=progressbar]]:bg-[#00D4FF]" />
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-[#00D4FF] text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. <strong className="text-white">Describe</strong> the vocal you want</p>
              <p>2. <strong className="text-white">Generate</strong> 4 variations at once</p>
              <p>3. <strong className="text-white">Pin</strong> your favorite sample</p>
              <p>4. <strong className="text-white">Refine</strong> with specific instructions</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Generated Samples */}
        <div className="space-y-8">
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#00D4FF]">
                  <Volume2 className="w-6 h-6" />
                  Generated Samples
                </CardTitle>
                {samples.length > 0 && (
                  <Badge variant="outline" className="border-[#00D4FF]/20 text-[#00D4FF]">
                    Gen #{samples[0]?.generationNumber || 1}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {samples.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Music2 className="w-16 h-16 mb-4 opacity-20" />
                  <p>Generate your first 4 vocal samples</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {samples.map((sample, index) => (
                      <motion.div
                        key={sample.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${
                          sample.isPinned 
                            ? 'bg-[#00D4FF]/10 border-[#00D4FF]' 
                            : 'bg-[#0a0a0a]/40 border-[#00D4FF]/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Sample Number */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            sample.isPinned ? 'bg-[#00D4FF] text-black' : 'bg-[#00D4FF]/20 text-[#00D4FF]'
                          }`}>
                            {index + 1}
                          </div>

                          {/* Audio Player */}
                          <div className="flex-1">
                            <audio
                              ref={(el) => { audioRefs.current[sample.id] = el; }}
                              src={sample.audioUrl}
                              onEnded={() => setSamples(prev => prev.map(s => s.id === sample.id ? { ...s, isPlaying: false } : s))}
                              className="w-full h-8"
                              controls
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${sample.isPinned ? 'text-[#00D4FF]' : 'text-muted-foreground'}`}
                              onClick={() => pinSample(sample.id)}
                            >
                              {sample.isPinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#00D4FF]"
                              onClick={() => downloadSample(sample.audioUrl, sample.id)}
                            >
                              <Download className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Refinement Button */}
                  {selectedSampleId && !isRefinementMode && (
                    <Button
                      className="w-full mt-4 gap-2 bg-[#00D4FF]/20 border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/30"
                      onClick={startRefinement}
                    >
                      <Wand2 className="w-5 h-5" />
                      Refine Pinned Sample
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

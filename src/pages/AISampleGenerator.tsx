import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Music2, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Volume2, 
  Settings,
  Radio,
  Piano,
  Guitar,
  Mic,
  Drum,
  ChevronRight,
  Sparkles,
  FileAudio,
  FileMusic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from 'react-dropzone';
import { supabase } from "@/integrations/supabase/client";

const INSTRUMENTS = [
  { id: 'acoustic-guitar', name: 'Acoustic Guitar', icon: Guitar },
  { id: 'electric-guitar-clean', name: 'Electric Guitar (Clean)', icon: Guitar },
  { id: 'electric-guitar-distorted', name: 'Electric Guitar (Distorted)', icon: Guitar },
  { id: 'rhodes', name: 'Rhodes', icon: Piano },
  { id: 'grand-piano', name: 'Grand Piano', icon: Piano },
  { id: 'synth-lead', name: 'Synth Lead', icon: Radio },
  { id: 'cello', name: 'Cello', icon: Music2 },
  { id: 'violin', name: 'Violin', icon: Music2 },
  { id: 'trumpet', name: 'Trumpet', icon: Mic },
  { id: 'saxophone', name: 'Saxophone', icon: Mic },
  { id: 'flute', name: 'Flute', icon: Music2 },
  { id: 'clarinet', name: 'Clarinet', icon: Music2 },
  { id: 'bass-guitar', name: 'Bass Guitar', icon: Guitar },
  { id: 'synth-bass', name: 'Synth Bass', icon: Radio },
  { id: 'double-bass', name: 'Double Bass', icon: Music2 },
  { id: 'drums', name: 'Drums', icon: Drum },
  { id: 'percussion', name: 'Percussion', icon: Drum },
  { id: 'harp', name: 'Harp', icon: Music2 },
  { id: 'organ', name: 'Organ', icon: Piano },
  { id: 'choir', name: 'Choir', icon: Mic },
  { id: 'strings', name: 'Strings', icon: Music2 },
  { id: 'brass', name: 'Brass', icon: Mic },
  { id: 'woodwinds', name: 'Woodwinds', icon: Music2 },
  { id: 'synth-pad', name: 'Synth Pad', icon: Radio },
  { id: 'synth-pluck', name: 'Synth Pluck', icon: Radio },
  { id: 'bell', name: 'Bell', icon: Music2 },
  { id: 'xylophone', name: 'Xylophone', icon: Music2 },
  { id: 'accordion', name: 'Accordion', icon: Music2 },
  { id: 'banjo', name: 'Banjo', icon: Guitar },
  { id: 'mandolin', name: 'Mandolin', icon: Guitar }
];

const GENRES = [
  { id: 'emotional-rap', name: 'Emotional Rap' },
  { id: 'drill', name: 'Drill' },
  { id: 'uk-rap', name: 'UK Rap' },
  { id: 'trap', name: 'Trap' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'cinematic', name: 'Cinematic' }
];

const MUSICAL_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const SCALES = [
  'Major', 'Minor', 'Pentatonic', 'Blues', 'Chromatic', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'
];

export default function AISampleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [bpm, setBpm] = useState([120]);
  const [musicalKey, setMusicalKey] = useState<string>("C");
  const [scale, setScale] = useState<string>("Major");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedMidiUrl, setGeneratedMidiUrl] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioPreview(url);
        toast.success(`Audio file uploaded: ${file.name}`);
      } else {
        toast.error('Please upload an audio file (WAV/MP3)');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.flac']
    },
    multiple: false
  });

  const generateSample = async () => {
    if (!audioFile) {
      toast.error("Please upload an audio file first.");
      return;
    }
    if (!selectedInstrument) {
      toast.error("Please select an instrument.");
      return;
    }
    if (!selectedGenre) {
      toast.error("Please select a genre.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Uploading audio...");
    setProgress(0);
    setGeneratedAudioUrl(null);
    setGeneratedMidiUrl(null);

    try {
      // 1. Upload Source File to Supabase Storage
      setGenerationStatus("Uploading audio...");
      setProgress(20);
      const sourcePath = `${crypto.randomUUID()}_${audioFile.name}`;
      const { error: sourceError } = await supabase.storage
        .from('audio-samples')
        .upload(sourcePath, audioFile);

      if (sourceError) throw sourceError;

      // 2. Generate sample using AI API
      setGenerationStatus("AI Processing...");
      setProgress(40);
      const { data: generationData, error: generationError } = await supabase.functions.invoke('ai-sample-generator', {
        body: {
          action: "generate",
          sourcePath,
          instrument: selectedInstrument,
          genre: selectedGenre,
          bpm: bpm[0],
          key: musicalKey,
          scale: scale
        },
      });

      if (generationError) throw generationError;

      // 3. Poll for result
      setGenerationStatus("Processing sample...");
      setProgress(60);
      let isComplete = false;
      let resultAudioUrl = "";
      let resultMidiUrl = "";
      let attempts = 0;
      const maxAttempts = 60;

      while (!isComplete && attempts < maxAttempts) {
        setProgress(Math.min(60 + (attempts / maxAttempts) * 30, 90));
        setGenerationStatus(`Processing... (${Math.round((attempts / maxAttempts) * 100)}%)`);

        const { data: pollData, error: pollError } = await supabase.functions.invoke('ai-sample-generator', {
          body: {
            action: "check",
            eventId: generationData.event_id,
            sourcePath
          },
        });

        if (pollError) throw pollError;

        if (pollData?.status === "complete") {
          resultAudioUrl = pollData.audio_url;
          resultMidiUrl = pollData.midi_url;
          isComplete = true;
          break;
        }

        if (pollData?.status === "error") {
          throw new Error("AI Processing failed");
        }

        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }

      if (!resultAudioUrl) throw new Error("Generation timed out");

      setGeneratedAudioUrl(resultAudioUrl);
      setGeneratedMidiUrl(resultMidiUrl);
      setProgress(100);
      toast.success("Sample generated successfully! ⚡");

    } catch (error) {
      console.error(error);
      toast.error(`Generation failed: ${error.message || "Please try again."}`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
      setProgress(0);
    }
  };

  const matchToOriginal = async () => {
    if (!audioFile || !generatedAudioUrl) {
      toast.error("Please upload audio and generate a sample first.");
      return;
    }

    setIsMatching(true);
    try {
      setGenerationStatus("Matching to original...");
      setProgress(50);

      const { data, error } = await supabase.functions.invoke('ai-sample-generator', {
        body: {
          action: "match",
          originalPath: audioFile.name,
          generatedPath: generatedAudioUrl
        },
      });

      if (error) throw error;

      setGeneratedAudioUrl(data.matched_audio_url);
      setProgress(100);
      toast.success("Sample matched to original! 🎯");

    } catch (error) {
      toast.error(`Matching failed: ${error.message}`);
    } finally {
      setIsMatching(false);
      setGenerationStatus("");
      setProgress(0);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`${filename} downloaded!`);
    } catch (error) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 relative overflow-hidden rounded-xl p-8 border border-[#00D4FF]/20 bg-gradient-to-r from-background via-[#0a0a0a] to-[#00D4FF]/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay" />
        <motion.h1
          className="text-5xl font-black tracking-tighter bg-gradient-to-r from-[#00D4FF] via-[#0099CC] to-[#0066FF] bg-clip-text text-transparent relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          AI SAMPLE GENERATOR v2.0
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground relative z-10 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Transform your melodies into professional samples with AI-powered instrumentation.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Input & Controls */}
        <div className="xl:col-span-2 space-y-8">
          {/* Audio Input */}
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00D4FF]">
                <Upload className="w-6 h-6" />
                Audio Input
              </CardTitle>
              <CardDescription>Upload your melody as the structure seed</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${
                  isDragActive 
                    ? 'border-[#00D4FF] bg-[#00D4FF]/10' 
                    : 'border-[#00D4FF]/20 hover:border-[#00D4FF]/40 bg-background/20'
                }`}
              >
                <input {...getInputProps()} />
                <FileAudio className={`w-12 h-12 ${isDragActive ? 'text-[#00D4FF]' : 'text-[#00D4FF]/60'} ${isDragActive ? 'animate-pulse' : ''}`} />
                <div className="text-center">
                  <p className="font-bold text-white">
                    {isDragActive ? 'Drop your audio here' : 'Drag & drop your audio file'}
                  </p>
                  <p className="text-sm text-muted-foreground">WAV, MP3, M4A, FLAC supported</p>
                </div>
              </div>
              
              {audioFile && (
                <div className="mt-4 p-4 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                  <div className="flex items-center gap-3">
                    <FileMusic className="w-5 h-5 text-[#00D4FF]" />
                    <span className="text-white font-medium">{audioFile.name}</span>
                  </div>
                  {audioPreview && (
                    <audio 
                      ref={audioRef} 
                      src={audioPreview} 
                      controls 
                      className="mt-3 w-full h-8"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instrument & Genre Selection */}
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00D4FF]">
                <Settings className="w-6 h-6" />
                Sample Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instrument Selector */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-[#00D4FF]">Instrument</Label>
                <Tabs defaultValue="grid" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0a]/60">
                    <TabsTrigger value="grid" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">Grid View</TabsTrigger>
                    <TabsTrigger value="search" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">Search</TabsTrigger>
                  </TabsList>
                  <TabsContent value="grid" className="mt-4">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                      {INSTRUMENTS.map((instrument) => {
                        const Icon = instrument.icon;
                        return (
                          <Button
                            key={instrument.id}
                            variant={selectedInstrument === instrument.id ? "default" : "outline"}
                            className={`h-auto p-3 flex flex-col items-center gap-2 ${
                              selectedInstrument === instrument.id 
                                ? 'bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF]' 
                                : 'border-[#00D4FF]/20 hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/10'
                            }`}
                            onClick={() => setSelectedInstrument(instrument.id)}
                          >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs text-center">{instrument.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="search" className="mt-4">
                    <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                      <SelectTrigger className="bg-[#0a0a0a]/60 border-[#00D4FF]/20">
                        <SelectValue placeholder="Select an instrument" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#00D4FF]/20">
                        {INSTRUMENTS.map((instrument) => (
                          <SelectItem key={instrument.id} value={instrument.id} className="text-white hover:bg-[#00D4FF]/20">
                            {instrument.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Genre Selector */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-[#00D4FF]">Genre</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {GENRES.map((genre) => (
                    <Button
                      key={genre.id}
                      variant={selectedGenre === genre.id ? "default" : "outline"}
                      className={`${
                        selectedGenre === genre.id 
                          ? 'bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF]' 
                          : 'border-[#00D4FF]/20 hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/10'
                      }`}
                      onClick={() => setSelectedGenre(genre.id)}
                    >
                      {genre.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Music Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-sm font-bold text-white">BPM</Label>
                    <span className="text-[#00D4FF] font-mono">{bpm[0]}</span>
                  </div>
                  <Slider
                    value={bpm}
                    min={60}
                    max={200}
                    step={1}
                    onValueChange={setBpm}
                    className="[&_[data-orientation=horizontal]]:bg-[#00D4FF]/20 [&_[data-orientation=horizontal]_[role=slider]]:bg-[#00D4FF]"
                  />
                </div>

                <div className="space-y-4">
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

                <div className="space-y-4">
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

              {/* Generate Button */}
              <Button
                className="w-full h-16 text-xl font-black bg-gradient-to-r from-[#00D4FF] via-[#0099CC] to-[#0066FF] hover:scale-[1.02] transition-transform shadow-xl shadow-[#00D4FF]/20"
                onClick={generateSample}
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
                    <span>GENERATE SAMPLE</span>
                  </div>
                )}
              </Button>

              {progress > 0 && (
                <Progress value={progress} className="h-2 bg-[#0a0a0a]/60 [&_[role=progressbar]]:bg-[#00D4FF]" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output & Actions */}
        <div className="space-y-8">
          <Card className="border-[#00D4FF]/20 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00D4FF]">
                <Volume2 className="w-6 h-6" />
                Output
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6">
              {/* Output Preview */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#00D4FF]/10 flex items-center justify-center border-4 border-[#00D4FF]/20 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[#00D4FF]/20 animate-pulse" />
                  <Music2 className="w-12 h-12 text-[#00D4FF] relative z-10" />
                </div>

                {!generatedAudioUrl ? (
                  <div className="text-center space-y-2 mt-6">
                    <p className="text-muted-foreground italic">Generate a sample to hear the result</p>
                  </div>
                ) : (
                  <div className="w-full space-y-4 mt-6">
                    <div className="p-4 rounded-xl bg-[#0a0a0a]/40 border border-[#00D4FF]/20">
                      <audio src={generatedAudioUrl} controls className="w-full h-8" />
                    </div>
                    
                    {/* Match Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 text-[#00D4FF]"
                      onClick={matchToOriginal}
                      disabled={isMatching}
                    >
                      {isMatching ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Matching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          <span>Match to Original</span>
                        </div>
                      )}
                    </Button>

                    {/* Download Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="gap-2 border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 text-[#00D4FF]"
                        onClick={() => downloadFile(generatedAudioUrl!, 'generated-sample.wav')}
                      >
                        <Download className="w-4 h-4" /> 
                        Audio
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 text-[#00D4FF]"
                        onClick={() => downloadFile(generatedMidiUrl!, 'generated-sample.mid')}
                        disabled={!generatedMidiUrl}
                      >
                        <FileMusic className="w-4 h-4" /> 
                        MIDI
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

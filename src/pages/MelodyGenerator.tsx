import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Music, Play, Pause, Download, Trash2, Wand2, RefreshCw } from "lucide-react";

export default function MelodyGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([15]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ bpm: string | null, key: string | null }>({ bpm: null, key: null });
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");

  // Artist / Style Categories (Looperman style)
  const styles = [
    { value: "trap_lilbaby", label: "Trap (Lil Baby type)" },
    { value: "trap_gunna", label: "Trap (Gunna type)" },
    { value: "drill_uk", label: "Drill (UK/NY)" },
    { value: "emotional_pain", label: "Emotional Pain (Rod Wave/Polo G)" },
    { value: "esdeekid", label: "Esdeekid Style" },
    { value: "kairo_keyz", label: "Kairo Keyz Style" },
    { value: "jazz", label: "Jazz / Neo-Soul" },
    { value: "rnb", label: "R&B / Soul" },
    { value: "cinematic", label: "Cinematic / Orchestral" },
    { value: "lofi", label: "Lo-Fi / Chill" },
    { value: "afrobeat", label: "Afrobeat" },
  ];

  // Expanded Instruments
  const instruments = [
    { value: "piano", label: "Piano / Keys" },
    { value: "electric_guitar", label: "Electric Guitar" },
    { value: "acoustic_guitar", label: "Acoustic Guitar" },
    { value: "synth", label: "Synthesizer / Leads" },
    { value: "bass", label: "Bass (808/Synth/Real)" },
    { value: "strings", label: "Strings / Violin / Cello" },
    { value: "brass", label: "Brass / Horns" },
    { value: "vocals", label: "Vocals / Chops" },
    { value: "flute", label: "Flute / Woodwinds" },
    { value: "ethnic", label: "Ethnic / World" },
    { value: "drums", label: "Drums / Percussion" },
  ];

  const extractMetadataFromFilename = (filename: string) => {
    // Regex for BPM (e.g., 140bpm, 140 bpm, 140)
    // strict: look for number followed by spacing/bpm, or just a number if clear context
    const bpmMatch = filename.match(/\b(\d{2,3})\s*(?:bpm)?\b/i);

    // Regex for Key (e.g., Cmin, C min, C minor, C#maj, etc.)
    // Strict: word boundary start -> Note -> opt #/b -> opt m/maj/min -> word boundary end
    // This prevents matching 'd' from 'devile' or 'l' from 'loop'
    // Matches: "Cmin", "F#m", "Eb Maj", "A minor", "G"
    const keyMatch = filename.match(/\b([A-G][#b]?\s*(?:maj|major|min|minor|m)?)\b/i);

    return {
      bpm: bpmMatch ? bpmMatch[1] : null,
      key: keyMatch ? keyMatch[1] : null
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const meta = extractMetadataFromFilename(file.name);
      setMetadata(meta);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    try {
      setIsGenerating(true);

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('melodies')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('melodies')
        .getPublicUrl(filePath);

      // 3. Call Edge Function
      const { data, error } = await supabase.functions.invoke('generate-melody', {
        body: {
          prompt: `${prompt} ${selectedStyle ? `in the style of ${selectedStyle}` : ''} ${selectedInstrument ? `using ${selectedInstrument}` : ''}`,
          melody: publicUrl,
          duration: duration[0],
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.output) {
        setGeneratedAudio(data.output);
        toast.success("Melody generated successfully!");
      } else {
        throw new Error("No output returned from AI");
      }

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          AI Melody Generator
        </h1>
        <p className="text-muted-foreground">
          Upload a melody, detect its soul, and let AI reimagine it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-1 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Input Melody
            </CardTitle>
            <CardDescription>Upload your starting point (MP3/WAV)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Music className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {file ? file.name : "Drop file here or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Naming format: Name 140bpm Cmin.mp3</p>
            </div>

            {file && (
              <div className="bg-secondary/50 rounded-md p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Detected Key:</span>
                  <span className="font-mono font-bold text-primary">{metadata.key || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Detected BPM:</span>
                  <span className="font-mono font-bold text-primary">{metadata.bpm || "Unknown"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card className="lg:col-span-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Generation Settings
            </CardTitle>
            <CardDescription>Shape the AI's creativity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Vibe Prompt</Label>
              <Input
                id="prompt"
                placeholder="E.g., Dark trap melody with heavy 808s, sad violin solo..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Style / Artist Inspiration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style (e.g. Lil Baby, Drill)" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instrument Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map((i) => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Duration ({duration}s)</Label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={30}
                  step={1}
                  min={5}
                />
              </div>
            </div>

            <Button
              className="w-full bg-primary hover://bg-primary/90 text-lg py-6 shadow-md shadow-primary/20"
              onClick={handleGenerate}
              disabled={isGenerating || !file}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" /> Generate Melody
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {generatedAudio && (
        <Card className="border-primary/20 shadow-lg shadow-primary/5 animate-in slide-in-from-bottom-5">
          <CardHeader>
            <CardTitle>Generated Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full">
              <audio controls src={generatedAudio} className="w-full" />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" className="gap-2" onClick={() => {
                const link = document.createElement('a');
                link.href = generatedAudio;
                link.download = `generated_melody_${new Date().getTime()}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                <Download className="h-4 w-4" /> Keep
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setGeneratedAudio(null)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

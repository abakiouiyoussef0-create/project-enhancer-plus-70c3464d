
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement generation logic
    setTimeout(() => {
      setIsGenerating(false);
      // Mock result for UI testing
      setGeneratedAudio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); 
    }, 2000);
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
              <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
            </div>

            {file && (
              <div className="bg-secondary/50 rounded-md p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Detected Key:</span>
                  <span className="font-mono font-bold text-primary">C Minor</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Detected BPM:</span>
                  <span className="font-mono font-bold text-primary">120</span>
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
                <Label>Instrument Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano">Piano / Keys</SelectItem>
                    <SelectItem value="synth">Synthesizer</SelectItem>
                    <SelectItem value="guitar">Guitar (Acoustic/Electric)</SelectItem>
                    <SelectItem value="strings">Strings / Orchestral</SelectItem>
                    <SelectItem value="bass">Bass</SelectItem>
                    <SelectItem value="brass">Brass / Horns</SelectItem>
                    <SelectItem value="vocals">Vocals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6 shadow-md shadow-primary/20"
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
            <div className="flex-1 bg-secondary/30 rounded-full h-12 flex items-center px-4 w-full">
              {/* Placeholder for waveform visualizer */}
              <div className="w-full h-8 flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-primary/50 rounded-full animate-pulse" 
                    style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="rounded-full h-12 w-12">
                <Play className="h-5 w-5" />
              </Button>
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" /> Keep
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

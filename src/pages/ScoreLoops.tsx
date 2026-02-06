import { useLoops } from '@/hooks/useLoops';
import { ScoreBar } from '@/components/ScoreBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import type { Loop } from '@/types/database';

// Scoring formulas as per the plan
function calculateGroove(loop: Loop): number {
  let score = 5; // Base score
  if (loop.bpm && loop.bpm > 110) score += 3;
  if (loop.status === 'Finished') score += 2;
  return Math.min(score, 10);
}

function calculateSoundQuality(loop: Loop): number {
  let score = 5;
  if (loop.quality_score && loop.quality_score > 7) score += 3;
  // Note: loops don't have mood field in schema, but we check notes for "dark"
  if (loop.notes?.toLowerCase().includes('dark')) score += 1;
  return Math.min(score, 10);
}

function calculateUsefulness(loop: Loop): number {
  let score = 6;
  if (loop.status === 'Ready to Send') score += 3;
  if (loop.quality_score && loop.quality_score > 8) score += 1;
  return Math.min(score, 10);
}

function calculateOriginality(loop: Loop): number {
  let score = 4;
  if (loop.quality_score && loop.quality_score > 6) score += 3;
  if (loop.source === 'Original') score += 2;
  return Math.min(score, 10);
}

function calculateFinalScore(loop: Loop): number {
  const groove = calculateGroove(loop);
  const soundQuality = calculateSoundQuality(loop);
  const usefulness = calculateUsefulness(loop);
  const originality = calculateOriginality(loop);
  return (groove + soundQuality + usefulness + originality) / 4;
}

export default function ScoreLoops() {
  const { data: loops = [], isLoading } = useLoops();
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);

  const selectedLoop = loops.find((l) => l.id === selectedLoopId);

  // Sort loops by final score (highest first)
  const sortedLoops = [...loops].sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-thunder-strike">
      <div>
        <h1 className="text-3xl font-bold lightning-glow">🎯 Score Loops</h1>
        <p className="text-muted-foreground">Automatic loop evaluation based on production metrics</p>
      </div>

      {/* Loop Selector */}
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Select a Loop to Analyze</label>
          <Select value={selectedLoopId || ''} onValueChange={setSelectedLoopId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a loop..." />
            </SelectTrigger>
            <SelectContent>
              {loops.map((loop) => (
                <SelectItem key={loop.id} value={loop.id}>
                  {loop.title} - {loop.style || 'No Style'} ({loop.bpm || '?'} BPM)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Loop Scores */}
        {selectedLoop && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{selectedLoop.title}</h2>
              {calculateFinalScore(selectedLoop) > 8 && (
                <span className="text-2xl animate-lightning-flash">⚡</span>
              )}
            </div>

            <div className="grid gap-4">
              <ScoreBar
                score={calculateGroove(selectedLoop)}
                label="Groove"
                showThunder
              />
              <ScoreBar
                score={calculateSoundQuality(selectedLoop)}
                label="Sound Quality"
                showThunder
              />
              <ScoreBar
                score={calculateUsefulness(selectedLoop)}
                label="Usefulness for Artists"
                showThunder
              />
              <ScoreBar
                score={calculateOriginality(selectedLoop)}
                label="Originality"
                showThunder
              />
            </div>

            <div className="border-t border-primary/30 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Final Loop Score</span>
                <span className={`text-3xl font-bold ${calculateFinalScore(selectedLoop) > 8 ? 'lightning-glow text-primary' : ''}`}>
                  {calculateFinalScore(selectedLoop).toFixed(1)}
                  {calculateFinalScore(selectedLoop) > 8 && ' ⚡'}
                </span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Groove:</strong> Base 5 + (BPM &gt; 110 ? +3) + (Finished ? +2)</p>
              <p><strong>Sound Quality:</strong> Base 5 + (Quality &gt; 7 ? +3) + (Dark theme ? +1)</p>
              <p><strong>Usefulness:</strong> Base 6 + (Ready to Send ? +3) + (Quality &gt; 8 ? +1)</p>
              <p><strong>Originality:</strong> Base 4 + (Quality &gt; 6 ? +3) + (Source = Original ? +2)</p>
            </div>
          </div>
        )}
      </div>

      {/* All Loops Ranking */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Thunder Power Rankings</h3>
        <div className="space-y-3">
          {sortedLoops.map((loop, index) => {
            const score = calculateFinalScore(loop);
            const isHigh = score > 8;
            return (
              <div
                key={loop.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isHigh ? 'bg-primary/20 border border-primary/50' : 'bg-muted/50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{loop.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {loop.style} • {loop.bpm} BPM • {loop.source || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-bold ${isHigh ? 'lightning-glow text-primary' : ''}`}>
                  {score.toFixed(1)} {isHigh && '⚡'}
                </div>
              </div>
            );
          })}
          {loops.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No loops to score yet. Create some loops first! 🔄
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

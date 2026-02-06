import { useBeats } from '@/hooks/useBeats';
import { ScoreBar } from '@/components/ScoreBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import type { Beat } from '@/types/database';

// Scoring formulas as per the plan
function calculateBounce(beat: Beat): number {
  let score = 5; // Base score
  if (beat.bpm && beat.bpm > 120) score += 3;
  if (beat.status === 'Finished') score += 2;
  return Math.min(score, 10);
}

function calculateSoundSelection(beat: Beat): number {
  let score = 5;
  if (beat.quality_score && beat.quality_score > 7) score += 3;
  if (beat.mood?.toLowerCase().includes('energetic')) score += 1;
  return Math.min(score, 10);
}

function calculateMixLevel(beat: Beat): number {
  let score = 6;
  if (beat.status === 'Finished') score += 3;
  if (beat.quality_score && beat.quality_score > 8) score += 1;
  return Math.min(score, 10);
}

function calculateOriginality(beat: Beat): number {
  let score = 4;
  if (beat.quality_score && beat.quality_score > 6) score += 3;
  if (beat.style && beat.style.trim() !== '') score += 2;
  return Math.min(score, 10);
}

function calculateFinalScore(beat: Beat): number {
  const bounce = calculateBounce(beat);
  const soundSelection = calculateSoundSelection(beat);
  const mixLevel = calculateMixLevel(beat);
  const originality = calculateOriginality(beat);
  return (bounce + soundSelection + mixLevel + originality) / 4;
}

export default function ScoreBeats() {
  const { data: beats = [], isLoading } = useBeats();
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);

  const selectedBeat = beats.find((b) => b.id === selectedBeatId);

  // Sort beats by final score (highest first)
  const sortedBeats = [...beats].sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a));

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
        <h1 className="text-3xl font-bold lightning-glow">🎯 Score Beats</h1>
        <p className="text-muted-foreground">Automatic beat evaluation based on production metrics</p>
      </div>

      {/* Beat Selector */}
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Select a Beat to Analyze</label>
          <Select value={selectedBeatId || ''} onValueChange={setSelectedBeatId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a beat..." />
            </SelectTrigger>
            <SelectContent>
              {beats.map((beat) => (
                <SelectItem key={beat.id} value={beat.id}>
                  {beat.title} - {beat.style || 'No Style'} ({beat.bpm || '?'} BPM)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Beat Scores */}
        {selectedBeat && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{selectedBeat.title}</h2>
              {calculateFinalScore(selectedBeat) > 8 && (
                <span className="text-2xl animate-lightning-flash">⚡</span>
              )}
            </div>

            <div className="grid gap-4">
              <ScoreBar
                score={calculateBounce(selectedBeat)}
                label="Bounce"
                showThunder
              />
              <ScoreBar
                score={calculateSoundSelection(selectedBeat)}
                label="Sound Selection"
                showThunder
              />
              <ScoreBar
                score={calculateMixLevel(selectedBeat)}
                label="Mix Level"
                showThunder
              />
              <ScoreBar
                score={calculateOriginality(selectedBeat)}
                label="Originality"
                showThunder
              />
            </div>

            <div className="border-t border-primary/30 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Final Beat Score</span>
                <span className={`text-3xl font-bold ${calculateFinalScore(selectedBeat) > 8 ? 'lightning-glow text-primary' : ''}`}>
                  {calculateFinalScore(selectedBeat).toFixed(1)}
                  {calculateFinalScore(selectedBeat) > 8 && ' ⚡'}
                </span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Bounce:</strong> Base 5 + (BPM &gt; 120 ? +3) + (Finished ? +2)</p>
              <p><strong>Sound Selection:</strong> Base 5 + (Quality &gt; 7 ? +3) + (Energetic mood ? +1)</p>
              <p><strong>Mix Level:</strong> Base 6 + (Finished ? +3) + (Quality &gt; 8 ? +1)</p>
              <p><strong>Originality:</strong> Base 4 + (Quality &gt; 6 ? +3) + (Has style ? +2)</p>
            </div>
          </div>
        )}
      </div>

      {/* All Beats Ranking */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Thunder Power Rankings</h3>
        <div className="space-y-3">
          {sortedBeats.map((beat, index) => {
            const score = calculateFinalScore(beat);
            const isHigh = score > 8;
            return (
              <div
                key={beat.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isHigh ? 'bg-primary/20 border border-primary/50' : 'bg-muted/50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{beat.title}</p>
                    <p className="text-xs text-muted-foreground">{beat.style} • {beat.bpm} BPM</p>
                  </div>
                </div>
                <div className={`text-xl font-bold ${isHigh ? 'lightning-glow text-primary' : ''}`}>
                  {score.toFixed(1)} {isHigh && '⚡'}
                </div>
              </div>
            );
          })}
          {beats.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No beats to score yet. Create some beats first! ⚡
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

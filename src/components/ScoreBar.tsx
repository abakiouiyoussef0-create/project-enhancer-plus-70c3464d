import { cn } from '@/lib/utils';

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label?: string;
  showThunder?: boolean;
}

export function ScoreBar({ score, maxScore = 10, label, showThunder = false }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const isHigh = score > 7.5;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn('font-bold', isHigh ? 'text-primary lightning-glow' : 'text-foreground')}>
            {score.toFixed(1)}
            {showThunder && isHigh && ' ⚡'}
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isHigh
              ? 'bg-gradient-to-r from-primary to-secondary animate-pulse-glow'
              : 'bg-primary/60'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

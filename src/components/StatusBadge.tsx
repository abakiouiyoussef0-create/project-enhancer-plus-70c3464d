import type { Status } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Finished':
        return 'bg-[hsl(120,100%,50%)] text-black';
      case 'In Progress':
        return 'bg-[hsl(60,100%,50%)] text-black animate-pulse';
      case 'Ready to Send':
        return 'bg-[hsl(240,100%,50%)] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        getStatusStyles()
      )}
    >
      {status}
    </span>
  );
}

import { ShieldX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl border border-destructive/30 shadow-2xl text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20 border-2 border-destructive/50">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Your email is not authorized to access the PERUNZ Production Suite.
          </p>

          {/* Info */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
            <p className="text-sm text-muted-foreground">
              This application is restricted to authorized producers only. If you believe this is an error, please contact the administrator.
            </p>
          </div>

          {/* Action */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            <Zap className="mr-2 h-4 w-4" />
            Sign Out & Try Different Account
          </Button>
        </div>
      </div>
    </div>
  );
}

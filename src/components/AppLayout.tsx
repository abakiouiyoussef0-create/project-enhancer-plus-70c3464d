import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isDilexit =
    user?.email?.toLowerCase() === 'dilexit.wav@gmail.com';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={`flex min-h-screen w-full ${isDilexit ? 'theme-dilexit' : ''}`}>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-primary/30 bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="text-foreground hover:text-primary" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

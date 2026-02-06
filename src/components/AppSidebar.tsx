import { Zap, Music, RefreshCw, Target, Calendar, BarChart3, LogOut, KeyRound } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Zap },
  { title: 'Creation Beats', url: '/beats', icon: Music },
  { title: 'Creation Loops', url: '/loops', icon: RefreshCw },
  { title: 'Score Beats', url: '/score-beats', icon: Target },
  { title: 'Score Loops', url: '/score-loops', icon: Target },
  { title: 'Weekly Planning', url: '/planning', icon: Calendar },
  { title: 'Analytics Hub', url: '/analytics', icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, signOut, updatePassword } = useAuth();
  const collapsed = state === 'collapsed';
  const isDilexit = user?.email?.toLowerCase() === 'dilexit.wav@gmail.com';

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully.');
        setIsPasswordDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/30">
      <SidebarHeader className="border-b border-primary/30 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            {isDilexit ? (
              <span className="text-xl leading-none text-primary-foreground">🕷️</span>
            ) : (
              <Zap className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold lightning-glow text-foreground">
                {isDilexit ? 'DILEXIT' : 'PERUNZ'}
              </span>
              <span className="text-xs text-muted-foreground">
                {isDilexit ? 'HOUSE OF SPIDER' : 'THUNDER Suite'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? 'bg-primary/20 text-primary border-l-2 border-primary' : ''}
                    >
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/30 p-4">
        {!collapsed && user && (
          <div className="mb-3 px-2 space-y-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                >
                  <KeyRound className="h-3 w-3" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

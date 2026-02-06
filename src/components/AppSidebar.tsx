import { Zap, Music, RefreshCw, Target, Calendar, BarChart3 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

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
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/30">
      <SidebarHeader className="border-b border-primary/30 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold lightning-glow text-foreground">PERUN</span>
              <span className="text-xs text-muted-foreground">THUNDER Suite</span>
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
    </Sidebar>
  );
}

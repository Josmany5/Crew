// Extracted from App.tsx
import { useState } from 'react';
import type React from 'react';
import { Link, useLocation } from 'wouter';
import { CalendarDays, ChevronRight, Compass, Heart, LogOut, MapPin, MessageCircle, MoreHorizontal, Rss, Zap } from 'lucide-react';
import { useGetConversations, useGetMyProfile } from '@workspace/api-client-react';
import { supabase } from '@/lib/supabase';
import { Onboarding } from '@/pages/onboarding';
import { Avatar } from './avatar';
import { Logo } from './logo';


const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/gyms', label: 'Gyms', icon: MapPin },
  { href: '/events', label: 'Sessions & trips', icon: CalendarDays },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: profile } = useGetMyProfile();
  const { data: conversations } = useGetConversations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasUnread = (conversations ?? []).some((conversation) => conversation.unreadCount > 0);
  if (profile && profile.onboarded === false) {
    return <Onboarding />;
  }
  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 px-1"><Logo /></div>
        <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">The local beta</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center justify-between rounded-xl px-3 py-3 text-[13px] font-bold transition-colors ${location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <span className="flex items-center gap-3"><Icon size={17} strokeWidth={location === href ? 2.5 : 2} />{label}</span>
              {href === '/messages' && hasUnread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary"><Zap size={14} fill="currentColor" /><span className="font-mono text-[10px] uppercase tracking-widest">Good to know</span></div>
            <p className="text-xs leading-relaxed text-sidebar-foreground/60">Your profile is only shown to climbers looking for the same kind of day.</p>
          </div>
          <Link data-testid="link-profile-sidebar" href="/profile" className="flex items-center gap-3 rounded-xl border border-sidebar-border px-3 py-3 hover:bg-sidebar-accent">
            <Avatar profile={profile} size="sm" />
            <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{profile?.name ?? 'Your profile'}</strong><span className="text-[11px] text-sidebar-foreground/50">Edit your details</span></span>
            <ChevronRight size={15} className="text-sidebar-foreground/40" />
          </Link>
          <button data-testid="button-sign-out" onClick={() => supabase.auth.signOut()} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"><LogOut size={14} /> Sign out</button>
        </div>
      </aside>
      {mobileOpen && <button data-testid="button-close-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-sidebar/40 md:hidden" />}
      <main className="min-h-[100dvh] md:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl md:px-10">
          <button data-testid="button-open-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted md:hidden"><MoreHorizontal size={20} /></button>
          <div className="hidden font-mono text-[10px] uppercase tracking-[.22em] text-muted-foreground md:block">Portland · 9:41 am</div>
          <div className="flex items-center gap-3">
            <Link data-testid="link-quick-profile" href="/profile" className="flex items-center gap-2 text-sm font-semibold hover:text-primary"><Avatar profile={profile} size="sm" /><span className="hidden sm:block">{profile?.name?.split(' ')[0] ?? 'Climber'}</span></Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export { AppShell };

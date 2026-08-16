// Extracted from App.tsx
import { Link } from 'wouter';
import { Mountain } from 'lucide-react';


function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link data-testid="link-logo" href="/" className="flex items-center gap-2.5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${light ? 'bg-primary text-primary-foreground' : 'bg-sidebar-primary text-sidebar-primary-foreground'}`}>
        <Mountain size={19} strokeWidth={2.5} />
      </span>
      <span className={`font-display text-[19px] font-bold tracking-[-0.04em] ${light ? 'text-primary' : 'text-sidebar-foreground'}`}>crew</span>
    </Link>
  );
}

export { Logo };

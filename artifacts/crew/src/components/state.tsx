// Extracted from App.tsx
import type React from 'react';


function LoadingState({ label = 'Finding your crew' }: { label?: string }) {
  return <div data-testid="status-loading" className="space-y-4"><div className="h-5 w-32 animate-pulse rounded bg-muted" /><div className="h-48 animate-pulse rounded-2xl bg-muted" /><p className="font-mono text-xs text-muted-foreground">{label}…</p></div>;
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div data-testid="status-error" className="crew-card rounded-2xl border-destructive/40 bg-destructive/5 p-8 text-center"><p className="font-display text-xl font-bold">That route got a little spicy.</p><p className="mt-2 text-sm text-muted-foreground">We couldn't load this right now. Give it another go.</p>{onRetry && <button data-testid="button-retry" onClick={onRetry} className="crew-button mt-5 rounded-lg bg-sidebar px-4 py-2 text-sm font-bold text-sidebar-foreground">Try again</button>}</div>;
}

function EmptyBlock({ icon, title, body, action, onAction }: { icon: React.ReactNode; title: string; body: string; action?: string; onAction?: () => void }) {
  return <div data-testid="empty-state" className="crew-card flex min-h-[280px] flex-col items-center justify-center rounded-[26px] p-8 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/25 text-foreground">{icon}</div><h2 className="font-display text-2xl font-bold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>{action && onAction && <button data-testid="button-empty-action" onClick={onAction} className="crew-button mt-5 rounded-full bg-sidebar px-5 py-3 text-sm font-bold text-sidebar-foreground">{action}</button>}</div>;
}

export { LoadingState, ErrorState, EmptyBlock };

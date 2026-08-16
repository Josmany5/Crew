// Extracted from App.tsx
import { Check, X } from 'lucide-react';


function PageNotice({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return (
    <div data-testid="status-notice" className={`slide-in fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${tone === 'success' ? 'bg-sidebar text-sidebar-foreground' : 'bg-destructive text-destructive-foreground'}`}>
      {tone === 'success' ? <Check size={16} className="text-primary" /> : <X size={16} />}
      {message}
    </div>
  );
}

export { PageNotice };

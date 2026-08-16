import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Tag-style input for list fields (disciplines, gyms, availability, gear).
 * Type and press Enter/comma to add; click a chip's × to remove.
 * Optional `suggestions` render quick-pick chips below the input.
 */
function ListInput({ label, items, onChange, testId, suggestions }: { label: string; items: string[]; onChange: (items: string[]) => void; testId: string; suggestions?: string[] }) {
  const [draft, setDraft] = useState('');

  const add = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    if (!items.includes(cleaned)) onChange([...items, cleaned]);
    setDraft('');
  };

  const remove = (item: string) => onChange(items.filter((existing) => existing !== item));

  const availableSuggestions = (suggestions ?? []).filter((option) => !items.includes(option));

  return (
    <label className="block sm:col-span-2">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      <div className="mb-2 flex min-h-[34px] flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} data-testid={`${testId}-chip-${item}`} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
            {item}
            <button type="button" aria-label={`Remove ${item}`} onClick={() => remove(item)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground/70">Nothing added yet.</span>}
      </div>
      <input
        data-testid={testId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => { if (draft.trim()) add(draft); }}
        placeholder="Type an option and press Enter"
        className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map((option) => (
            <button key={option} type="button" data-testid={`${testId}-suggest-${option}`} onClick={() => add(option)} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground">{option} +</button>
          ))}
        </div>
      )}
    </label>
  );
}

export { ListInput };

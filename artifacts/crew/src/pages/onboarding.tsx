import { useEffect, useState } from 'react';
import type React from 'react';
import { ArrowLeft, ArrowRight, Check, Mountain } from 'lucide-react';
import { getGetMyProfileQueryKey, useGetMyProfile, useUpdateMyProfile } from '@workspace/api-client-react';
import type { ProfileUpdate } from '@workspace/api-client-react';
import { ListInput } from '@/components/list-input';
import { uploadPublicImage } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';

const STEPS = [
  { label: 'Basics', title: 'What should we call you?', hint: 'People match with people, not usernames.' },
  { label: 'Style', title: 'What do you climb?', hint: 'Pick the styles you actually do — this drives who you see.' },
  { label: 'Schedule', title: 'When are you free?', hint: 'The more specific, the easier it is to make plans.' },
  { label: 'Gyms', title: 'Where do you climb?', hint: 'Home gyms are the fastest way to find local partners.' },
  { label: 'Gear', title: 'What do you bring?', hint: 'Rope? Pads? Nothing? Be honest — it matters.' },
  { label: 'About you', title: 'Tell people who you are', hint: 'A good bio means better matches.' },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span>{children}</label>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />;
}

function Onboarding() {
  const profileQuery = useGetMyProfile();
  const profile = profileQuery.data;
  const update = useUpdateMyProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileUpdate>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && Object.keys(form).length === 0) {
      setForm({
        name: profile.name === 'Climber' ? '' : profile.name,
        age: profile.age || undefined,
        location: profile.location || 'Portland, OR',
        bio: profile.bio ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        disciplines: profile.disciplines ?? [],
        gyms: profile.gyms ?? [],
        availability: profile.availability ?? [],
        gear: profile.gear ?? [],
        climbingLevel: profile.climbingLevel ?? '',
        openToDating: profile.openToDating ?? false,
      });
    }
  }, [profile]);

  const set = (patch: Partial<ProfileUpdate>) => setForm((prev) => ({ ...prev, ...patch }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    update.mutate(
      { data: { ...form, onboarded: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        },
        onError: () => setError('Could not save — check your connection and try again.'),
      },
    );
  };

  const stepInfo = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-6 py-12 text-sidebar-foreground">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, hsl(74 100% 69% / .14), transparent 32%), radial-gradient(circle at 15% 85%, hsl(14 49% 64% / .2), transparent 30%)' }} />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Mountain size={22} strokeWidth={2.5} /></span>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Step {step + 1} of {STEPS.length} · {stepInfo.label}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-.05em]">{stepInfo.title}</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/60">{stepInfo.hint}</p>
        </div>

        <div className="rounded-[26px] border border-sidebar-foreground/10 bg-card p-6 text-foreground shadow-2xl md:p-7">
          <div className="mb-6 flex gap-1.5">
            {STEPS.map((s, i) => <div key={s.label} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />)}
          </div>

          {step === 0 && <div className="space-y-4"><Field label="First name"><TextInput value={form.name ?? ''} onChange={(v) => set({ name: v })} placeholder="Sam" /></Field><Field label="Age"><TextInput type="number" value={form.age ? String(form.age) : ''} onChange={(v) => set({ age: Number(v) || undefined })} placeholder="31" /></Field></div>}
          {step === 1 && <ListInput label="Disciplines" items={form.disciplines ?? []} onChange={(items) => set({ disciplines: items })} testId="onboarding-disciplines" suggestions={['Bouldering', 'Ropes', 'Outdoor']} />}
          {step === 2 && <ListInput label="Climbing days & times" items={form.availability ?? []} onChange={(items) => set({ availability: items })} testId="onboarding-availability" suggestions={['Tue evenings', 'Wed evenings', 'Thu after 6', 'Fri evenings', 'Sat mornings', 'Sun afternoons', 'Weekend trips']} />}
          {step === 3 && <ListInput label="Home gyms" items={form.gyms ?? []} onChange={(items) => set({ gyms: items })} testId="onboarding-gyms" suggestions={['The Circuit', 'Portland Rock Gym', 'Montavilla Climbing']} />}
          {step === 4 && <div className="space-y-4"><ListInput label="Gear on hand" items={form.gear ?? []} onChange={(items) => set({ gear: items })} testId="onboarding-gear" suggestions={['60m rope', '70m rope', 'belay device', 'crash pad', 'climbing shoes', 'quickdraws', 'harness', 'chalk bag']} /><Field label="Climbing level"><TextInput value={form.climbingLevel ?? ''} onChange={(v) => set({ climbingLevel: v })} placeholder="V4 / 5.10b" /></Field></div>}
          {step === 5 && <div className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold">Profile photo</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const url = await uploadPublicImage('avatar', file); if (!url) { setError('Photo upload failed — you can add one later.'); return; } set({ avatarUrl: url }); }} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-bold" /><span className="mt-1.5 block text-[11px] text-muted-foreground">Optional — adds a lot of trust.</span></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Bio</span><textarea rows={3} value={form.bio ?? ''} onChange={(e) => set({ bio: e.target.value })} placeholder="Tell people who you are — a good bio means better matches." className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></label></div>}

          {error && <p data-testid="onboarding-error" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">{error}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={back} disabled={step === 0} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted disabled:opacity-40"><ArrowLeft size={15} /> Back</button>
            {isLast ? <button type="button" data-testid="button-onboarding-finish" disabled={update.isPending} onClick={finish} className="crew-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground">{update.isPending ? 'Setting up…' : <><Check size={16} /> Start finding partners</>}</button> : <button type="button" data-testid="button-onboarding-next" onClick={next} className="crew-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground">Next <ArrowRight size={15} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Onboarding };


import { useState } from 'react';
import type React from 'react';
import { ChevronRight, Mountain } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function SignIn() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (!data.session) {
        setError('Check your email to confirm your account, then log in.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }
    setLoading(false);
  };

  const google = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setError(`Google sign-in isn't enabled yet. Enable it in Supabase → Authentication → Sign In / Providers → Google, then try again. (${error.message})`);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-6 text-sidebar-foreground">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, hsl(74 100% 69% / .14), transparent 32%), radial-gradient(circle at 15% 85%, hsl(14 49% 64% / .2), transparent 30%)' }} />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Mountain size={22} strokeWidth={2.5} /></span>
          <h1 className="font-display text-4xl font-bold tracking-[-.05em]">Join the crew.</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/60">Climbing partners, not dating profiles.</p>
        </div>

        <div className="rounded-[26px] border border-sidebar-foreground/10 bg-card p-6 text-foreground shadow-2xl md:p-7">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button type="button" onClick={() => { setMode('signup'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'signup' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Create account</button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'login' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Log in</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Password</span>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </label>
            {error && <p data-testid="auth-error" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="crew-button w-full rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground">{loading ? 'One sec…' : mode === 'signup' ? 'Create account' : 'Log in'}</button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div>

          <button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold hover:bg-muted">Continue with Google</button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-sidebar-foreground/50">Your profile is only shown to climbers looking for the same kind of day. <ChevronRight className="inline" size={12} /></p>
      </div>
    </div>
  );
}

export { SignIn };

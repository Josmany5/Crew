import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { queryClient } from '@/lib/query-client';
import { supabase, getAccessToken } from '@/lib/supabase';
import { SignIn } from '@/pages/sign-in';
import { Home } from '@/pages/home';
import { Discover } from '@/pages/discover';
import { Matches } from '@/pages/matches';
import { Gyms } from '@/pages/gyms';
import { Events } from '@/pages/events';
import { Messages } from '@/pages/messages';
import { Profile } from '@/pages/profile';

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/discover" component={Discover} /><Route path="/matches" component={Matches} /><Route path="/gyms" component={Gyms} /><Route path="/events" component={Events} /><Route path="/messages" component={Messages} /><Route path="/profile" component={Profile} /><Route path="/sign-in"><Redirect to="/discover" /></Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // The API client attaches the current Supabase token to every request.
    setAuthTokenGetter(getAccessToken);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  if (authLoading) {
    return <div data-testid="status-loading" className="flex min-h-[100dvh] items-center justify-center bg-sidebar"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!session) {
    // Signed out: show the landing page first; anything else routes to sign-in.
    return <QueryClientProvider client={queryClient}><TooltipProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in" component={SignIn} />
        <Route component={SignIn} />
      </Switch>
      <Toaster />
    </TooltipProvider></QueryClientProvider>;
  }

  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;


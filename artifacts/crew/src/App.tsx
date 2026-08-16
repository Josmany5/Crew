import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { queryClient } from '@/lib/query-client';
import { Home } from '@/pages/home';
import { Discover } from '@/pages/discover';
import { Gyms } from '@/pages/gyms';
import { Events } from '@/pages/events';
import { Messages } from '@/pages/messages';
import { Profile } from '@/pages/profile';

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/discover" component={Discover} /><Route path="/gyms" component={Gyms} /><Route path="/events" component={Events} /><Route path="/messages" component={Messages} /><Route path="/profile" component={Profile} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;

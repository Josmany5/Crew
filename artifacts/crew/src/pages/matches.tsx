import { useState } from 'react';
import { useLocation } from 'wouter';
import { Heart, MessageCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { getGetMatchesQueryKey, useCreateConversation, useGetMatches, useUnmatch } from '@workspace/api-client-react';
import type { Match } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { Avatar } from '@/components/avatar';
import { EmptyBlock, LoadingState, ErrorState } from '@/components/state';
import { PageNotice } from '@/components/notice';
import { queryClient } from '@/lib/query-client';

function Matches() {
  const matchesQuery = useGetMatches();
  const matches = matchesQuery.data ?? [];
  const [, setLocation] = useLocation();
  const createConversation = useCreateConversation();
  const unmatch = useUnmatch();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const message = (match: Match) => {
    setBusy(match.id);
    createConversation.mutate(
      { data: { profileId: match.profile.id } },
      {
        onSuccess: (conversation) => setLocation(`/messages?conversation=${conversation.id}`),
        onError: () => { setNotice("Couldn't start that conversation."); setTimeout(() => setNotice(''), 3000); },
        onSettled: () => setBusy(null),
      },
    );
  };

  const doUnmatch = (match: Match) => {
    setBusy(match.id);
    unmatch.mutate(
      { matchId: match.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMatchesQueryKey() });
          setNotice(`Unmatched with ${match.profile.name}.`);
          setTimeout(() => setNotice(''), 3000);
        },
        onError: () => { setNotice("Couldn't unmatch."); setTimeout(() => setNotice(''), 3000); },
        onSettled: () => setBusy(null),
      },
    );
  };

  return <AppShell><div className="mx-auto max-w-[1100px] px-5 py-8 md:px-10 md:py-12"><div className="mb-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Mutual sends only</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em] md:text-5xl">Your matches.</h1><p className="mt-3 text-sm text-muted-foreground">Everyone you've clicked with — message them, or move on.</p></div>{matchesQuery.isLoading ? <LoadingState label="Rounding up your crew" /> : matchesQuery.isError ? <ErrorState onRetry={() => matchesQuery.refetch()} /> : !matches.length ? <EmptyBlock icon={<Heart />} title="No matches yet" body="When you and another climber both say “I’d climb with them,” they show up here." action="Find climbers" onAction={() => setLocation('/discover')} /> : <div className="grid gap-4 md:grid-cols-2">{(matches).map((match) => <div data-testid={`row-match-${match.id}`} key={match.id} className="crew-card flex items-center gap-4 rounded-[22px] p-4 md:p-5"><Avatar profile={match.profile} size="md" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-display text-lg font-bold">{match.profile.name}, {match.profile.age}</h2>{match.profile.verified && <ShieldCheck size={15} className="shrink-0 text-primary" />}</div><p className="truncate text-xs text-muted-foreground">{match.profile.disciplines.join(' · ') || match.profile.location}</p><p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{match.matchedAt}</p></div><div className="flex shrink-0 flex-col gap-2"><button data-testid={`button-message-${match.id}`} disabled={busy === match.id} onClick={() => message(match)} className="crew-button flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><MessageCircle size={14} /> Message</button><button data-testid={`button-unmatch-${match.id}`} disabled={busy === match.id} onClick={() => doUnmatch(match)} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-[11px] font-bold text-muted-foreground hover:border-destructive hover:text-destructive"><Trash2 size={13} /> Unmatch</button></div></div>)}</div>}{notice && <PageNotice message={notice} />}</div></AppShell>;
}

export { Matches };

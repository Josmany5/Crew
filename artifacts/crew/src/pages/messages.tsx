// Extracted from App.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, Flag, MessageCircle, MoreHorizontal, Send, Sparkles, User } from 'lucide-react';
import { getGetConversationsQueryKey, getGetMessagesQueryKey, useCreateMessage, useGetConversations, useGetMessages } from '@workspace/api-client-react';
import type { Conversation, Message } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { Avatar } from '@/components/avatar';
import { EmptyBlock, LoadingState, ErrorState } from '@/components/state';
import { PageNotice } from '@/components/notice';
import { queryClient } from '@/lib/query-client';


function Messages() {
  const conversationsQuery = useGetConversations();
  const conversations = conversationsQuery.data ?? [];
  const [location, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState('');
  const [body, setBody] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [moreNotice, setMoreNotice] = useState('');
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const requestedConversation = new URLSearchParams(location.split('?')[1] ?? '').get('conversation');
  useEffect(() => {
    if (requestedConversation && conversations.some((conversation) => conversation.id === requestedConversation)) {
      setSelectedId(requestedConversation);
    } else if (!selectedId && conversations[0]) {
      setSelectedId(conversations[0].id);
    }
  }, [selectedId, conversations, requestedConversation]);
  const messagesQuery = useGetMessages(selected?.id ?? '', { query: { queryKey: getGetMessagesQueryKey(selected?.id ?? ''), enabled: Boolean(selected?.id) } });
  const send = useCreateMessage();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    send.mutate({ conversationId: selected.id, data: { body: body.trim() } }, {
      onSuccess: () => { setBody(''); queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selected.id) }); queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() }); },
    });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Keep the plan alive</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em] md:text-5xl">Messages.</h1>
        </div>
        {conversationsQuery.isLoading ? <LoadingState label="Finding your conversations" /> : conversationsQuery.isError ? <ErrorState onRetry={() => conversationsQuery.refetch()} /> : !conversations.length ? <EmptyBlock icon={<MessageCircle />} title="No conversations yet" body="When you and another climber both say “I’d climb with them,” the first message starts here." action="Discover climbers" onAction={() => setLocation('/discover')} /> : (
          <div className="crew-card grid min-h-[580px] overflow-hidden rounded-[26px] md:grid-cols-[300px_1fr]">
            <ConversationList conversations={conversations} selectedId={selected?.id} readIds={readIds} onSelect={setSelectedId} />
            <ThreadView
              selected={selected ?? null}
              messagesQuery={messagesQuery}
              readIds={readIds}
              moreOpen={moreOpen}
              setMoreOpen={setMoreOpen}
              setReadIds={setReadIds}
              setMoreNotice={setMoreNotice}
              setLocation={setLocation}
              body={body}
              setBody={setBody}
              onSubmit={submit}
              sendPending={send.isPending}
            />
          </div>
        )}
        {moreNotice && <PageNotice message={moreNotice} />}
      </div>
    </AppShell>
  );
}

function ConversationList({ conversations, selectedId, readIds, onSelect }: { conversations: Conversation[]; selectedId?: string; readIds: string[]; onSelect: (id: string) => void }) {
  return (
    <div className="border-b border-border bg-muted/30 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between border-b border-border p-5">
        <span className="font-display text-xl font-bold">Your crew</span>
        <span className="font-mono text-[10px] text-muted-foreground">{conversations.length} threads</span>
      </div>
      <div className="p-2">
        {conversations.map((conversation: Conversation) => (
          <button data-testid={`button-conversation-${conversation.id}`} key={conversation.id} onClick={() => onSelect(conversation.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${selectedId === conversation.id ? 'bg-card shadow-sm' : 'hover:bg-card/60'}`}>
            <Avatar profile={conversation.profile} size="sm" />
            <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{conversation.profile.name}</strong><span className="block truncate text-xs text-muted-foreground">{conversation.lastMessage}</span></span>
            {conversation.unreadCount > 0 && !readIds.includes(conversation.id) && <span className="rounded-full bg-primary px-2 py-1 font-mono text-[10px] font-bold">{conversation.unreadCount}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
function ThreadView({ selected, messagesQuery, readIds, moreOpen, setMoreOpen, setReadIds, setMoreNotice, setLocation, body, setBody, onSubmit, sendPending }: {
  selected: Conversation | null;
  messagesQuery: { isLoading: boolean; data?: Message[] };
  readIds: string[];
  moreOpen: boolean;
  setMoreOpen: (v: boolean) => void;
  setReadIds: React.Dispatch<React.SetStateAction<string[]>>;
  setMoreNotice: (v: string) => void;
  setLocation: (path: string) => void;
  body: string;
  setBody: (v: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  sendPending: boolean;
}) {
  return (
    <div className="flex min-h-[520px] flex-col">
      {selected ? (
        <>
          <div className="flex items-center gap-3 border-b border-border p-5">
            <Avatar profile={selected.profile} />
            <div><h2 className="font-display text-xl font-bold">{selected.profile.name}</h2><p className="text-xs text-muted-foreground">{selected.profile.location} · {selected.profile.disciplines.join(' · ')}</p></div>
            <div className="relative ml-auto">
              <button data-testid="button-message-more" aria-label="Thread options" onClick={() => setMoreOpen(!moreOpen)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><MoreHorizontal size={18} /></button>
              {moreOpen && (
                <>
                  <button data-testid="button-more-backdrop" aria-label="Close menu" onClick={() => setMoreOpen(false)} className="fixed inset-0 z-40" />
                  <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                    <button data-testid="button-more-view-profile" onClick={() => { setMoreOpen(false); setLocation(`/profile/${selected.profile.id}`); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-muted"><User size={14} /> View profile</button>
                    <button data-testid="button-more-mark-read" onClick={() => { setMoreOpen(false); setReadIds((prev) => (prev.includes(selected.id) ? prev : [...prev, selected.id])); setMoreNotice('Marked as read.'); setTimeout(() => setMoreNotice(''), 2000); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-muted"><Check size={14} /> Mark as read</button>
                    <button data-testid="button-more-report" onClick={() => { setMoreOpen(false); setMoreNotice('Thanks — we’ll take a look.'); setTimeout(() => setMoreNotice(''), 2500); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-destructive hover:bg-muted"><Flag size={14} /> Report climber</button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-5">
            {messagesQuery.isLoading ? <LoadingState label="Opening the thread" /> : (messagesQuery.data ?? []).length ? (messagesQuery.data ?? []).map((message) => (
              <div data-testid={`message-${message.id}`} key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.isMine ? 'rounded-br-md bg-sidebar text-sidebar-foreground' : 'rounded-bl-md bg-card shadow-sm'}`}>{message.body}<div className={`mt-1 font-mono text-[9px] ${message.isMine ? 'text-sidebar-foreground/45' : 'text-muted-foreground'}`}>{message.sentAt}</div></div>
              </div>
            )) : (
              <div data-testid="empty-messages" className="flex h-full flex-col items-center justify-center text-center"><Sparkles className="mb-3 text-primary" size={25} /><p className="font-display text-lg font-bold">Start with the plan.</p><p className="mt-1 text-xs text-muted-foreground">Ask about their next gym day or suggest one.</p></div>
            )}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border bg-card p-4">
            <input data-testid="input-message-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Message ${selected.profile.name.split(' ')[0]}…`} className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <button data-testid="button-send-message" disabled={sendPending || !body.trim()} className="crew-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Send size={17} /></button>
          </form>
        </>
      ) : null}
    </div>
  );
}

export { Messages };


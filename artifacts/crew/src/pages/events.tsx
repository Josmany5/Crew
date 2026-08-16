// Extracted from App.tsx
import { useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { getGetEventsQueryKey, useCreateEvent, useGetEvents, useRsvpToEvent } from '@workspace/api-client-react';
import type { ClimbingEvent, EventInput } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { EventCard } from '@/components/event-card';
import { CreateEventModal } from '@/components/create-event-modal';
import { LoadingState, ErrorState, EmptyBlock } from '@/components/state';
import { PageNotice } from '@/components/notice';
import { queryClient } from '@/lib/query-client';


function Events() {
  const [type, setType] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState('');
  const params = useMemo(() => ({ type: type as 'all' | 'gym' | 'outdoor' | 'trip' }), [type]);
  const eventsQuery = useGetEvents(params, { query: { queryKey: getGetEventsQueryKey(params) } });
  const rsvp = useRsvpToEvent();
  const create = useCreateEvent();
  const [form, setForm] = useState<EventInput>({ title: '', type: 'gym', dateLabel: '', timeLabel: '', location: '', description: '', spots: 6 });
  const setField = (field: keyof EventInput, value: string) => setForm((prev) => ({ ...prev, [field]: field === 'spots' ? Number(value) : value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { setShowCreate(false); setNotice('Your session is on the board.'); setForm({ title: '', type: 'gym', dateLabel: '', timeLabel: '', location: '', description: '', spots: 6 }); queryClient.invalidateQueries({ queryKey: getGetEventsQueryKey(params) }); setTimeout(() => setNotice(''), 3000); } }); };
  const doRsvp = (event: ClimbingEvent) => rsvp.mutate({ eventId: event.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetEventsQueryKey(params) }); setNotice(event.joined ? 'You left the session.' : 'You’re on the list.'); setTimeout(() => setNotice(''), 3000); } });
  return <AppShell><div className="mx-auto max-w-[1200px] px-5 py-8 md:px-10 md:py-12"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Plans with people in them</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em] md:text-5xl">What’s happening.</h1><p className="mt-3 text-sm text-muted-foreground">A good climbing day is rarely a solo project.</p></div><button data-testid="button-create-event" onClick={() => setShowCreate(true)} className="crew-button rounded-full bg-sidebar px-5 py-3 text-sm font-extrabold text-sidebar-foreground"><Plus className="mr-2 inline text-primary" size={16} /> Create a plan</button></div><div className="mt-8 flex gap-2 overflow-x-auto pb-1">{['all', 'gym', 'outdoor', 'trip'].map((item) => <button data-testid={`button-event-filter-${item}`} key={item} onClick={() => setType(item)} className={`rounded-full border px-4 py-2.5 text-xs font-bold capitalize ${type === item ? 'border-sidebar bg-sidebar text-sidebar-foreground' : 'border-border bg-card text-muted-foreground'}`}>{item === 'all' ? 'All plans' : item === 'gym' ? 'Gym sessions' : item === 'outdoor' ? 'Outdoor days' : 'Trips'}</button>)}</div>{eventsQuery.isLoading ? <div className="mt-8"><LoadingState label="Reading the local calendar" /></div> : eventsQuery.isError ? <div className="mt-8"><ErrorState onRetry={() => eventsQuery.refetch()} /></div> : <div className="mt-8 grid gap-5 lg:grid-cols-2">{(eventsQuery.data ?? []).length ? (eventsQuery.data ?? []).map((event, i) => <EventCard key={event.id} event={event} featured={i === 0} onRsvp={() => doRsvp(event)} pending={rsvp.isPending} />) : <div className="lg:col-span-2"><EmptyBlock icon={<CalendarDays />} title="The calendar is wide open" body="Be the person who starts the next good session." action="Create a plan" onAction={() => setShowCreate(true)} /></div>}</div>}{showCreate && <CreateEventModal form={form} setField={setField} onSubmit={submit} onClose={() => setShowCreate(false)} pending={create.isPending} />}{notice && <PageNotice message={notice} />}</div></AppShell>;
}

export { Events };

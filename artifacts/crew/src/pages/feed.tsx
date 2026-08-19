import { useMemo, useState } from 'react';
import { Check, Image as ImageIcon, Loader2, Send, Tag, X } from 'lucide-react';
import { getGetFeedQueryKey, useCreatePost, useGetFeed, useGetPeople } from '@workspace/api-client-react';
import type { ClimberProfile } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { Avatar } from '@/components/avatar';
import { PostCard } from '@/components/post-card';
import { LoadingState, ErrorState, EmptyBlock } from '@/components/state';
import { uploadPublicImage } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';

function Composer() {
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [tagOpen, setTagOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const createPost = useCreatePost();
  const peopleQuery = useGetPeople();
  const people = peopleQuery.data ?? [];
  const filteredPeople = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    return q ? people.filter((p) => p.name.toLowerCase().includes(q) || (p.gyms ?? []).join(' ').toLowerCase().includes(q)) : people;
  }, [people, tagQuery]);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setUploadError('');
    const url = await uploadPublicImage('post', file);
    setUploading(false);
    if (!url) {
      setUploadError('Photo upload failed — try again or post without a photo.');
      setTimeout(() => setUploadError(''), 4000);
      return;
    }
    setImageUrl(url);
  };

  const toggleTag = (id: string) => setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const submit = () => {
    if (!body.trim() && !imageUrl) return;
    setBusy(true);
    createPost.mutate(
      { data: { body: body.trim() ? body.trim() : undefined, imageUrl: imageUrl ?? undefined, taggedProfileIds: tags.length ? tags : undefined } },
      {
        onSuccess: () => { setBody(''); setImageUrl(null); setTags([]); queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() }); setBusy(false); },
        onError: () => { setBusy(false); },
      },
    );
  };

  return (
    <div className="crew-card rounded-[22px] p-5 md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Share a send, a plan, or a question</p>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder={imageUrl ? "Add a caption…" : "What's happening in your climbing life?"} className="mt-3 w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
      {imageUrl && <div className="relative mt-2 overflow-hidden rounded-xl bg-muted/30"><img src={imageUrl} alt="" className="max-h-64 w-full object-contain" /><button type="button" aria-label="Remove photo" onClick={() => setImageUrl(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"><X size={14} /></button></div>}
      {uploading && <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={13} className="animate-spin" /> Uploading photo…</p>}
      {uploadError && <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">{uploadError}</p>}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((id) => {
            const person = people.find((p) => p.id === id);
            if (!person) return null;
            return (
              <span key={id} className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 py-1 pl-1 pr-2 text-[11px] font-semibold text-foreground"><Avatar profile={person} size="sm" /> {person.name.split(' ')[0]}<button type="button" aria-label={`Remove tag ${person.name}`} onClick={() => toggleTag(id)} className="text-muted-foreground hover:text-destructive"><X size={11} /></button></span>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"><ImageIcon size={13} /> {uploading ? 'Uploading…' : 'Photo'}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} /></label>
        <button type="button" data-testid="button-tag-people" onClick={() => setTagOpen((v) => !v)} className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold hover:bg-muted ${tagOpen || tags.length ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border text-muted-foreground'}`}><Tag size={13} /> Tag climbers{tags.length ? ` (${tags.length})` : ''}</button>
        <button type="button" data-testid="button-post" disabled={busy || (!body.trim() && !imageUrl)} onClick={submit} className="crew-button ml-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Send size={13} /> Post</button>
      </div>
      {tagOpen && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border p-3"><input data-testid="input-tag-search" value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} placeholder="Search people by name or gym…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /></div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {peopleQuery.isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading people…</p> : filteredPeople.length ? filteredPeople.map((person: ClimberProfile) => (
              <button key={person.id} type="button" onClick={() => toggleTag(person.id)} className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-muted">
                <Avatar profile={person} size="sm" />
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{person.name}</strong><span className="block truncate text-[11px] text-muted-foreground">{person.gyms.join(' · ') || person.disciplines.join(' · ')}</span></span>
                {tags.includes(person.id) && <Check className="shrink-0 text-primary" size={16} />}
              </button>
            )) : <p className="p-4 text-sm text-muted-foreground">No one matches "{tagQuery}".</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Feed() {
  const feedQuery = useGetFeed();
  const feed = feedQuery.data ?? [];
  return <AppShell><div className="mx-auto max-w-[760px] px-5 py-8 md:px-10 md:py-12"><div className="mb-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">The beta</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em] md:text-5xl">Feed.</h1><p className="mt-3 text-sm text-muted-foreground">Sends, plans, check-ins, and questions from the crew.</p></div><Composer /><div className="mt-6 space-y-5">{feedQuery.isLoading ? <LoadingState label="Loading the feed" /> : feedQuery.isError ? <ErrorState onRetry={() => feedQuery.refetch()} /> : feed.length ? feed.map((post) => <PostCard key={post.id} post={post} />) : <EmptyBlock icon={<ImageIcon />} title="Nothing here yet" body="Be the first to post — a send, a plan, or a question for the crew." />}</div></div></AppShell>;
}

export { Feed };

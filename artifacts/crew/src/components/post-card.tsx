import { useState } from 'react';
import { Image as ImageIcon, MapPin, Send, Tag, X } from 'lucide-react';
import { getGetFeedQueryKey, useCreatePost, useGetDiscoverProfiles, useGetFeed } from '@workspace/api-client-react';
import type { Post } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { Avatar } from '@/components/avatar';
import { LoadingState, ErrorState, EmptyBlock } from '@/components/state';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';

function PostCard({ post }: { post: Post }) {
  return (
    <article data-testid={`post-${post.id}`} className="crew-card rounded-[22px] p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Avatar profile={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">{post.author.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
        </div>
        {post.postType === 'checkin' && <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-[11px] font-bold text-primary"><MapPin size={12} /> Checked in</span>}
      </div>
      {post.postType === 'checkin' && post.checkinGymName && <p className="mt-3 text-sm font-bold"><MapPin size={13} className="mr-1 inline text-primary" />Checked in at {post.checkinGymName}</p>}
      {post.body && <p className="mt-3 text-sm leading-relaxed text-foreground/85">{post.body}</p>}
      {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-3 max-h-[420px] w-full rounded-xl object-cover" />}
      {post.taggedProfiles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.taggedProfiles.map((person) => (
            <span key={person.id} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"><Tag size={10} /> {person.name}</span>
          ))}
        </div>
      )}
    </article>
  );
}

export { PostCard };

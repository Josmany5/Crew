import { useState } from 'react';
import { Link } from 'wouter';
import { MapPin, Tag, Trash2 } from 'lucide-react';
import { getGetFeedQueryKey, getGetProfilePostsQueryKey, useDeletePost, useGetMyProfile } from '@workspace/api-client-react';
import type { Post } from '@workspace/api-client-react';
import { Avatar } from '@/components/avatar';
import { queryClient } from '@/lib/query-client';

function PostCard({ post }: { post: Post }) {
  const { data: me } = useGetMyProfile();
  const deletePost = useDeletePost();
  const [confirming, setConfirming] = useState(false);
  const isMine = me?.id === post.author.id;

  const remove = () => {
    deletePost.mutate(
      { postId: post.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProfilePostsQueryKey(post.author.id) });
        },
      },
    );
  };

  return (
    <article data-testid={`post-${post.id}`} className="crew-card rounded-[22px] p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Link data-testid={`link-author-${post.author.id}`} href={`/profile/${post.author.id}`} aria-label={post.author.name}><Avatar profile={post.author} size="md" /></Link>
        <div className="min-w-0 flex-1">
          <Link data-testid={`link-author-name-${post.author.id}`} href={`/profile/${post.author.id}`} className="block truncate font-display text-base font-bold hover:text-primary">{post.author.name}</Link>
          <p className="font-mono text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
        </div>
        {post.postType === 'checkin' && <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-[11px] font-bold text-primary"><MapPin size={12} /> Checked in</span>}
        {isMine && (
          <div className="relative">
            {confirming ? (
              <div className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1">
                <span className="text-[10px] font-bold text-destructive">Delete?</span>
                <button type="button" onClick={remove} disabled={deletePost.isPending} className="text-[11px] font-extrabold text-destructive hover:underline">{deletePost.isPending ? '…' : 'Yes'}</button>
                <button type="button" onClick={() => setConfirming(false)} className="text-[11px] font-bold text-muted-foreground hover:underline">No</button>
              </div>
            ) : (
              <button type="button" aria-label="Delete post" onClick={() => setConfirming(true)} className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-destructive"><Trash2 size={15} /></button>
            )}
          </div>
        )}
      </div>
      {post.postType === 'checkin' && post.checkinGymName && <p className="mt-3 text-sm font-bold"><MapPin size={13} className="mr-1 inline text-primary" />Checked in at {post.checkinGymName}</p>}
      {post.body && <p className="mt-3 text-sm leading-relaxed text-foreground/85">{post.body}</p>}
      {post.imageUrl && <div className="mt-3 overflow-hidden rounded-xl bg-muted/30"><img src={post.imageUrl} alt="" className="mx-auto max-h-[520px] w-full object-contain" loading="lazy" /></div>}
      {post.taggedProfiles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.taggedProfiles.map((person) => (
            <Link data-testid={`link-tag-${person.id}`} key={person.id} href={`/profile/${person.id}`} className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 py-1 pl-1 pr-3 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-foreground"><Avatar profile={person} size="sm" /><Tag size={10} /> {person.name}</Link>
          ))}
        </div>
      )}
    </article>
  );
}

export { PostCard };


import { Link, useParams } from 'wouter';
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react';
import { getGetProfilePostsQueryKey, useGetProfile, useGetProfilePosts } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { PostCard } from '@/components/post-card';
import { LoadingState, ErrorState } from '@/components/state';

/**
 * Public view of another climber: their photo, details, and posts.
 * Reached by clicking a name/avatar/tag anywhere in the app.
 */
function ClimberProfile() {
  const { profileId = '' } = useParams<{ profileId: string }>();
  const profileQuery = useGetProfile(profileId, { query: { queryKey: [`getProfile`, profileId], enabled: Boolean(profileId) } });
  const postsQuery = useGetProfilePosts(profileId, { query: { queryKey: getGetProfilePostsQueryKey(profileId), enabled: Boolean(profileId) } });
  const profile = profileQuery.data;

  if (profileQuery.isLoading) return <AppShell><div className="mx-auto max-w-[1000px] px-5 py-12"><LoadingState label="Loading climber" /></div></AppShell>;
  if (profileQuery.isError || !profile) {
    return <AppShell><div className="mx-auto max-w-[1000px] px-5 py-12"><ErrorState onRetry={() => profileQuery.refetch()} /><Link href="/feed" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back to the feed</Link></div></AppShell>;
  }

  const posts = postsQuery.data ?? [];
  return (
    <AppShell>
      <div className="mx-auto max-w-[1000px] px-5 py-8 md:px-10 md:py-12">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back to the feed</Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="crew-card overflow-hidden rounded-[26px]">
            <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-contain" /> : <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(135deg, hsl(14 49% 64%), hsl(74 52% 56%))' }} />}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><ShieldCheck size={14} className="text-primary" /> verified climber</div>
              <h2 className="mt-2 font-display text-3xl font-bold">{profile.name}, {profile.age}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={13} /> {profile.location}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/75">{profile.bio}</p>
              <div className="mt-6 flex flex-wrap gap-2">{profile.disciplines.map((item) => <span key={item} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold capitalize">{item}</span>)}</div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="crew-card rounded-[26px] p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Their rhythm</p>
              <h3 className="mt-1 font-display text-xl font-bold">When & where they climb</h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Home gyms</span><p className="mt-1.5 text-sm font-bold capitalize">{profile.gyms.join(' · ') || 'Not set'}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Free time</span><p className="mt-1.5 text-sm font-bold capitalize">{profile.availability.join(' · ') || 'Not set'}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Level</span><p className="mt-1.5 text-sm font-bold capitalize">{profile.climbingLevel ?? 'Not set'}</p></div>
                <div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Gear on hand</span><p className="mt-1.5 text-sm font-bold capitalize">{profile.gear.join(' · ') || 'Not set'}</p></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Their beta</p>
          <h3 className="mt-1 font-display text-2xl font-bold">{profile.name.split(' ')[0]}'s posts</h3>
          <div className="mt-4 space-y-4">
            {postsQuery.isLoading ? <LoadingState label="Loading posts" /> : posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <p className="rounded-2xl bg-muted/40 p-5 text-sm text-muted-foreground">No posts yet.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { ClimberProfile };

// Extracted from App.tsx
import type { ClimberProfile } from '@workspace/api-client-react';


function initials(name = 'Crew') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ profile, size = 'md' }: { profile?: ClimberProfile; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 w-9 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-xl' };
  const position = profile?.avatarPositionX != null && profile?.avatarPositionY != null ? `${profile.avatarPositionX}% ${profile.avatarPositionY}%` : undefined;
  return profile?.avatarUrl ? (
    <img data-testid={`img-avatar-${profile.id}`} style={position ? { objectPosition: position } : undefined} className={`${sizes[size]} rounded-full object-cover ring-2 ring-background`} src={profile.avatarUrl} alt={profile.name} />
  ) : (
    <div data-testid={`avatar-fallback-${profile?.id ?? 'current'}`} className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground ring-2 ring-background`}>
      {initials(profile?.name)}
    </div>
  );
}

export { initials, Avatar };

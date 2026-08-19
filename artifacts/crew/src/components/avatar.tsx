// Extracted from App.tsx
import type { ClimberProfile } from '@workspace/api-client-react';


function initials(name = 'Crew') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ profile, size = 'md' }: { profile?: ClimberProfile; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 w-9 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-xl' };
  const posX = profile?.avatarPositionX ?? 50;
  const posY = profile?.avatarPositionY ?? 50;
  const zoom = profile?.avatarZoom ?? 1;
  return profile?.avatarUrl ? (
    <div data-testid={`img-avatar-${profile.id}`} className={`${sizes[size]} relative shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-background`}>
      <img
        src={profile.avatarUrl}
        alt={profile.name}
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'cover', objectPosition: `${posX}% ${posY}%`, transform: `scale(${zoom})` }}
      />
    </div>
  ) : (
    <div data-testid={`avatar-fallback-${profile?.id ?? 'current'}`} className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground ring-2 ring-background`}>
      {initials(profile?.name)}
    </div>
  );
}

export { initials, Avatar };

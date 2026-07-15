'use client';

import Image from 'next/image';

interface TeamLogoProps {
  logoUrl: string;
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamLogo({ logoUrl, teamName, size = 'sm' }: TeamLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Fallback: iniciais do time se logo não disponível
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!logoUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-slate-700 flex items-center justify-center text-slate-100 text-xs font-semibold`}
        title={teamName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-700`} title={teamName}>
      <Image
        src={logoUrl}
        alt={teamName}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

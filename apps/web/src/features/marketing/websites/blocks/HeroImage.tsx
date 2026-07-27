import { cn } from '@/lib/utils';

type Props = {
  src: string | null;
  className?: string;
  alt?: string;
};

export function HeroImage({ src, className, alt = '' }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('h-full w-full object-cover', className)}
        loading="eager"
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-400 text-neutral-500',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-16 w-16 opacity-40" fill="currentColor">
        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v7l4-4 4 4 4-4 4 4V7H4Zm4 3a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      </svg>
    </div>
  );
}

import type { WebsiteLocale } from '@factory/shared';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  locales: WebsiteLocale[];
  current: WebsiteLocale;
  onChange: (locale: WebsiteLocale) => void;
  theme: Theme;
  className?: string;
};

const LABEL: Record<WebsiteLocale, string> = { de: 'DE', en: 'EN' };

export function LocaleSwitcher({ locales, current, onChange, theme, className }: Props) {
  if (locales.length < 2) return null;
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border p-0.5', className)}>
      {locales.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            className={cn(
              'rounded-full px-3 py-1 font-mono text-xs tabular-nums transition',
              active
                ? theme === 'dark'
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-900 text-white'
                : theme === 'dark'
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-500 hover:text-neutral-900',
            )}
          >
            {LABEL[l]}
          </button>
        );
      })}
    </div>
  );
}

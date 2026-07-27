import type { Faq, WebsiteLocale } from '@factory/shared';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  faqs: Faq[];
  locale: WebsiteLocale;
  theme: Theme;
};

function hasContent(f: Faq, locale: WebsiteLocale): boolean {
  return (
    pickLocalized(f.question, locale).trim().length > 0 ||
    pickLocalized(f.answer, locale).trim().length > 0
  );
}

export function FaqSection({ faqs, locale, theme }: Props) {
  const visible = faqs.filter((f) => hasContent(f, locale));
  if (visible.length === 0) return null;

  const q = theme === 'dark' ? 'text-white' : 'text-neutral-900';
  const a = cn('mt-2 text-sm', theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600');
  const marker = theme === 'dark' ? 'text-neutral-400' : 'text-neutral-400';

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6">
      <div className="max-w-3xl space-y-6">
        {visible.map((f, i) => (
        <details key={i} className="group">
          <summary
            className={cn(
              'flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium',
              q,
            )}
          >
            <span>{pickLocalized(f.question, locale)}</span>
            <span
              className={cn(
                'ml-2 text-lg leading-none transition-transform group-open:rotate-45',
                marker,
              )}
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className={a}>{pickLocalized(f.answer, locale)}</p>
        </details>
        ))}
      </div>
    </section>
  );
}

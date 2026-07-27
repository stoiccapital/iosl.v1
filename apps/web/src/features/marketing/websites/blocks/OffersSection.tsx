import type { Offer, WebsiteLocale } from '@factory/shared';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  offers: Offer[];
  locale: WebsiteLocale;
  theme: Theme;
};

function hasContent(o: Offer, locale: WebsiteLocale): boolean {
  return (
    pickLocalized(o.title, locale).trim().length > 0 ||
    pickLocalized(o.body, locale).trim().length > 0
  );
}

export function OffersSection({ offers, locale, theme }: Props) {
  const visible = offers.filter((o) => hasContent(o, locale));
  if (visible.length === 0) return null;

  const bodyCls = cn('mt-2 text-sm', theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600');

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6">
      <div
        className={cn(
          'grid gap-10',
          visible.length === 1
            ? 'sm:grid-cols-1'
            : visible.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {visible.map((o, i) => (
          <div key={i}>
            <h3 className="text-base font-semibold">{pickLocalized(o.title, locale)}</h3>
            <p className={bodyCls}>{pickLocalized(o.body, locale)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

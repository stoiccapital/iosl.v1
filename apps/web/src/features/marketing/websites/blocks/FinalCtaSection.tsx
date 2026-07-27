import type { FinalCta, WebsiteLocale } from '@factory/shared';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  cta: FinalCta;
  locale: WebsiteLocale;
  theme: Theme;
  targetId: string;
};

export function FinalCtaSection({ cta, locale, theme, targetId }: Props) {
  const headline = pickLocalized(cta.headline, locale);
  const sub = pickLocalized(cta.subheadline, locale);
  const label = pickLocalized(cta.label, locale);
  if (!headline && !label) return null;

  const subCls = theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600';
  const link = cn(
    'mt-6 inline-flex items-center text-sm font-medium underline underline-offset-4',
    theme === 'dark' ? 'text-white hover:text-neutral-300' : 'text-neutral-900 hover:text-neutral-700',
  );

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{headline}</h2>
      {sub && <p className={cn('mt-3 max-w-xl text-base', subCls)}>{sub}</p>}
      {label && (
        <a href={`#${targetId}`} className={link}>
          {label} →
        </a>
      )}
    </section>
  );
}

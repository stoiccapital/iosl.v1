import type { WebsiteLocale, WebsitePageCopy } from '@factory/shared';
import { FaqSection } from './FaqSection';
import { FinalCtaSection } from './FinalCtaSection';
import { OffersSection } from './OffersSection';

type Theme = 'dark' | 'light';

type Props = {
  page: WebsitePageCopy;
  locale: WebsiteLocale;
  theme: Theme;
  targetId: string;
};

export function PageOutro({ page, locale, theme, targetId }: Props) {
  return (
    <>
      <OffersSection offers={page.offers} locale={locale} theme={theme} />
      <FaqSection faqs={page.faqs} locale={locale} theme={theme} />
      <FinalCtaSection cta={page.finalCta} locale={locale} theme={theme} targetId={targetId} />
    </>
  );
}

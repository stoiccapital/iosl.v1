import { Link } from 'react-router-dom';
import type { WebsiteLocale } from '@factory/shared';
import { UI_COPY, t } from '@/features/marketing/websites/lib/copy';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  slug: string;
  siteName: string;
  locale: WebsiteLocale;
  theme: Theme;
  previewMode?: boolean;
};

export function TemplateFooter({ slug, siteName, locale, theme, previewMode }: Props) {
  const link = cn(
    'text-xs underline-offset-4 hover:underline',
    theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900',
  );
  const bar = cn(
    'text-xs',
    theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400',
  );
  return (
    <footer
      className={cn(
        'mt-32 border-t px-6 py-8',
        theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className={bar}>© {new Date().getFullYear()} {siteName}</p>
        <nav className="flex items-center gap-4">
          {previewMode ? (
            <>
              <span className={link}>{t(UI_COPY.common.impressum, locale)}</span>
              <span className={link}>{t(UI_COPY.common.privacy, locale)}</span>
            </>
          ) : (
            <>
              <Link to={`/sites/${slug}/${locale}/impressum`} className={link}>
                {t(UI_COPY.common.impressum, locale)}
              </Link>
              <Link to={`/sites/${slug}/${locale}/datenschutz`} className={link}>
                {t(UI_COPY.common.privacy, locale)}
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}

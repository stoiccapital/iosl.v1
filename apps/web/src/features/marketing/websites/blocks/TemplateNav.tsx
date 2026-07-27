import { NavLink } from 'react-router-dom';
import type { Website, WebsiteLocale } from '@factory/shared';
import { LocaleSwitcher } from './LocaleSwitcher';
import { UI_COPY, t } from '@/features/marketing/websites/lib/copy';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  site: Website;
  locale: WebsiteLocale;
  onLocaleChange: (locale: WebsiteLocale) => void;
  theme: Theme;
  previewMode?: boolean;
};

export function TemplateNav({ site, locale, onLocaleChange, theme, previewMode }: Props) {
  const base = `/sites/${site.slug}/${locale}`;
  const linkCls = (isActive: boolean) =>
    cn(
      'text-sm transition',
      theme === 'dark'
        ? isActive
          ? 'text-white'
          : 'text-neutral-400 hover:text-white'
        : isActive
          ? 'text-neutral-900'
          : 'text-neutral-500 hover:text-neutral-900',
    );

  const brandCls = cn(
    'text-sm font-semibold tracking-widest uppercase',
    theme === 'dark' ? 'text-white' : 'text-neutral-900',
  );

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      {previewMode ? (
        <span className={brandCls}>{site.name}</span>
      ) : (
        <NavLink to={`${base}/ride`} className={brandCls}>
          {site.name}
        </NavLink>
      )}
      <nav className="flex items-center gap-6">
        {previewMode ? (
          <>
            <span className={linkCls(false)}>{t(UI_COPY.common.ride, locale)}</span>
            <span className={linkCls(false)}>{t(UI_COPY.common.drive, locale)}</span>
          </>
        ) : (
          <>
            <NavLink to={`${base}/ride`} className={({ isActive }) => linkCls(isActive)}>
              {t(UI_COPY.common.ride, locale)}
            </NavLink>
            <NavLink to={`${base}/drive`} className={({ isActive }) => linkCls(isActive)}>
              {t(UI_COPY.common.drive, locale)}
            </NavLink>
          </>
        )}
        <LocaleSwitcher
          locales={site.locales}
          current={locale}
          onChange={onLocaleChange}
          theme={theme}
          className={theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'}
        />
      </nav>
    </header>
  );
}

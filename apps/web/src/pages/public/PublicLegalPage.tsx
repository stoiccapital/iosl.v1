import { Link, useParams } from 'react-router-dom';
import type { WebsiteLocale } from '@factory/shared';
import { WebsiteLocaleSchema } from '@factory/shared';
import { LocaleSwitcher } from '@/features/marketing/websites/blocks/LocaleSwitcher';
import { UI_COPY, t } from '@/features/marketing/websites/lib/copy';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import { usePublicSite } from '@/features/marketing/websites/hooks';
import { getTemplate } from '@/features/marketing/websites/templates/registry';
import { PublicError, PublicLoading } from './PublicStatus';
import { PublicShell } from './PublicShell';

type Kind = 'impressum' | 'privacy';

export function PublicLegalPage({ kind }: { kind: Kind }) {
  const { slug, locale: rawLocale } = useParams<{ slug: string; locale?: string }>();
  const query = usePublicSite(slug);

  if (query.isLoading) return <PublicLoading />;
  if (query.isError || !query.data) return <PublicError />;

  const site = query.data;
  const parsed = WebsiteLocaleSchema.safeParse(rawLocale);
  const requested: WebsiteLocale | undefined = parsed.success ? parsed.data : undefined;
  const locale: WebsiteLocale =
    requested && site.locales.includes(requested) ? requested : site.defaultLocale;

  const theme = getTemplate(site.templateId).theme;
  const body = pickLocalized(site.content[kind].body, locale);
  const title =
    kind === 'impressum' ? t(UI_COPY.common.impressum, locale) : t(UI_COPY.common.privacy, locale);

  const bg = theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const linkCls =
    theme === 'dark'
      ? 'text-white/60 hover:text-white'
      : 'text-slate-500 hover:text-slate-900';

  return (
    <PublicShell>
      <div className={`min-h-screen ${bg}`}>
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link
            to={`/sites/${site.slug}/${locale}`}
            className={`text-sm font-semibold tracking-widest uppercase ${linkCls}`}
          >
            ← {site.name}
          </Link>
          <LocaleSwitcher
            locales={site.locales}
            current={locale}
            onChange={(l) => {
              // Rewrite same path with new locale
              const path = kind === 'impressum' ? 'impressum' : 'datenschutz';
              window.location.href = `/sites/${site.slug}/${l}/${path}`;
            }}
            theme={theme}
            className={theme === 'dark' ? 'border-white/15' : 'border-slate-200'}
          />
        </header>
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <pre
            className={`mt-8 whitespace-pre-wrap font-sans text-sm leading-relaxed ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-700'
            }`}
          >
            {body}
          </pre>
        </article>
      </div>
    </PublicShell>
  );
}

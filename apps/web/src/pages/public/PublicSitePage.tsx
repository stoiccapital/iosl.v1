import { useNavigate, useParams, Navigate } from 'react-router-dom';
import type { WebsiteLocale } from '@factory/shared';
import { WebsiteLocaleSchema } from '@factory/shared';
import { usePublicSite } from '@/features/marketing/websites/hooks';
import { getTemplate } from '@/features/marketing/websites/templates/registry';
import { PublicShell } from './PublicShell';
import { PublicError, PublicLoading } from './PublicStatus';

type Kind = 'ride' | 'drive';

function useResolvedLocale(): {
  slug: string | undefined;
  requested: WebsiteLocale | undefined;
} {
  const { slug, locale } = useParams<{ slug: string; locale?: string }>();
  const parsed = WebsiteLocaleSchema.safeParse(locale);
  return { slug, requested: parsed.success ? parsed.data : undefined };
}

/** Root redirector: /sites/:slug → /sites/:slug/:defaultLocale/ride */
export function PublicRootRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const query = usePublicSite(slug);
  if (query.isLoading) return <PublicLoading />;
  if (query.isError || !query.data) return <PublicError />;
  return <Navigate to={`/sites/${query.data.slug}/${query.data.defaultLocale}/ride`} replace />;
}

/** Locale-only redirector: /sites/:slug/:locale → /sites/:slug/:locale/ride */
export function PublicLocaleRedirect() {
  const { slug, requested } = useResolvedLocale();
  return <Navigate to={`/sites/${slug}/${requested ?? 'de'}/ride`} replace />;
}

export function PublicPage({ kind }: { kind: Kind }) {
  const nav = useNavigate();
  const { slug, requested } = useResolvedLocale();
  const query = usePublicSite(slug);

  if (query.isLoading) return <PublicLoading />;
  if (query.isError || !query.data) return <PublicError />;

  const site = query.data;
  const locale: WebsiteLocale =
    requested && site.locales.includes(requested) ? requested : site.defaultLocale;

  const meta = getTemplate(site.templateId);
  const Page = kind === 'ride' ? meta.RidePage : meta.DrivePage;

  return (
    <PublicShell>
      <Page
        site={site}
        locale={locale}
        onLocaleChange={(l) => nav(`/sites/${site.slug}/${l}/${kind}`)}
      />
    </PublicShell>
  );
}

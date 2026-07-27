import { ApplicantForm } from '@/features/marketing/websites/blocks/ApplicantForm';
import { HeroImage } from '@/features/marketing/websites/blocks/HeroImage';
import { PageOutro } from '@/features/marketing/websites/blocks/PageOutro';
import { RideFlow } from '@/features/marketing/websites/blocks/RideFlow';
import { TemplateFooter } from '@/features/marketing/websites/blocks/TemplateFooter';
import { TemplateNav } from '@/features/marketing/websites/blocks/TemplateNav';
import { pickLocalized } from '@/features/marketing/websites/lib/localized';
import type { TemplateProps } from './types';

const RIDE_FORM_ID = 'ride-form';
const DRIVE_FORM_ID = 'drive-form';

const THEME = 'dark';

function Shell({
  children,
  site,
  locale,
  onLocaleChange,
  previewMode,
}: TemplateProps & { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-neutral-900 text-white">
      <TemplateNav
        site={site}
        locale={locale}
        onLocaleChange={onLocaleChange}
        theme={THEME}
        previewMode={!!previewMode}
      />
      {children}
      <TemplateFooter
        slug={site.slug}
        siteName={site.name}
        locale={locale}
        theme={THEME}
        previewMode={!!previewMode}
      />
    </div>
  );
}

export function SignatureRidePage(props: TemplateProps) {
  const { site, locale } = props;
  const c = site.content;
  const cta = pickLocalized(c.hero.ctaRideLabel, locale);
  return (
    <Shell {...props}>
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {pickLocalized(c.pages.ride.headline, locale)}
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-400">
          {pickLocalized(c.pages.ride.subheadline, locale)}
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <HeroImage src={c.hero.imageUrl} />
        </div>
      </section>
      <section id={RIDE_FORM_ID} className="mx-auto mt-24 max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-neutral-300">{cta}</h2>
          <RideFlow site={site} locale={locale} theme={THEME} ctaLabel={cta} />
        </div>
      </section>
      <PageOutro
        page={c.pages.ride}
        locale={locale}
        theme={THEME}
        targetId={RIDE_FORM_ID}
      />
    </Shell>
  );
}

export function SignatureDrivePage(props: TemplateProps) {
  const { site, locale } = props;
  const c = site.content;
  const cta = pickLocalized(c.hero.ctaDriverLabel, locale);
  return (
    <Shell {...props}>
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {pickLocalized(c.pages.drive.headline, locale)}
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-400">
          {pickLocalized(c.pages.drive.subheadline, locale)}
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <HeroImage src={c.hero.imageUrl} />
        </div>
      </section>
      <section id={DRIVE_FORM_ID} className="mx-auto mt-24 max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-neutral-300">{cta}</h2>
          <ApplicantForm slug={site.slug} locale={locale} theme={THEME} ctaLabel={cta} />
        </div>
      </section>
      <PageOutro
        page={c.pages.drive}
        locale={locale}
        theme={THEME}
        targetId={DRIVE_FORM_ID}
      />
    </Shell>
  );
}

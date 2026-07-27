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

const THEME = 'light';

function Shell({
  children,
  site,
  locale,
  onLocaleChange,
  previewMode,
}: TemplateProps & { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-gradient-to-b from-amber-50 to-neutral-50 text-neutral-900">
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

function HeroSection({
  eyebrow,
  headline,
  sub,
  imageUrl,
}: {
  eyebrow: string;
  headline: string;
  sub: string;
  imageUrl: string | null;
}) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-left">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-700">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-700">{sub}</p>
      </section>
      <section className="mx-auto max-w-6xl px-6">
        <div className="aspect-[16/10] w-full overflow-hidden">
          <HeroImage src={imageUrl} />
        </div>
      </section>
    </>
  );
}

export function HeroBelowRidePage(props: TemplateProps) {
  const { site, locale } = props;
  const c = site.content;
  const cta = pickLocalized(c.hero.ctaRideLabel, locale);
  return (
    <Shell {...props}>
      <HeroSection
        eyebrow={site.name}
        headline={pickLocalized(c.pages.ride.headline, locale)}
        sub={pickLocalized(c.pages.ride.subheadline, locale)}
        imageUrl={c.hero.imageUrl}
      />
      <section id={RIDE_FORM_ID} className="mx-auto mt-24 max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="mb-4 text-lg font-semibold">{cta}</h2>
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

export function HeroBelowDrivePage(props: TemplateProps) {
  const { site, locale } = props;
  const c = site.content;
  const cta = pickLocalized(c.hero.ctaDriverLabel, locale);
  return (
    <Shell {...props}>
      <HeroSection
        eyebrow={site.name}
        headline={pickLocalized(c.pages.drive.headline, locale)}
        sub={pickLocalized(c.pages.drive.subheadline, locale)}
        imageUrl={c.hero.imageUrl}
      />
      <section id={DRIVE_FORM_ID} className="mx-auto mt-24 max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="mb-4 text-lg font-semibold">{cta}</h2>
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

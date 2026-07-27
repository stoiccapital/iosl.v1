import { z } from 'zod';

export const WebsiteLocaleSchema = z.enum(['de', 'en']);
export type WebsiteLocale = z.infer<typeof WebsiteLocaleSchema>;

export const WebsiteTemplateIdSchema = z.enum([
  'dark-classic',
  'light-classic',
  'hero-side',
  'hero-below',
  'signature',
]);
export type WebsiteTemplateId = z.infer<typeof WebsiteTemplateIdSchema>;

export const WebsiteStatusSchema = z.enum(['draft', 'published']);
export type WebsiteStatus = z.infer<typeof WebsiteStatusSchema>;

export const LocalizedTextSchema = z.object({
  de: z.string().default(''),
  en: z.string().default(''),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

/* ---------- Hero shell + per-page copy ---------- */

export const WebsiteHeroContentSchema = z.object({
  imageUrl: z.string().nullable(),
  ctaRideLabel: LocalizedTextSchema,
  ctaDriverLabel: LocalizedTextSchema,
});
export type WebsiteHeroContent = z.infer<typeof WebsiteHeroContentSchema>;

export const OfferSchema = z.object({
  title: LocalizedTextSchema,
  body: LocalizedTextSchema,
});
export type Offer = z.infer<typeof OfferSchema>;

export const FaqSchema = z.object({
  question: LocalizedTextSchema,
  answer: LocalizedTextSchema,
});
export type Faq = z.infer<typeof FaqSchema>;

export const FinalCtaSchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema,
  label: LocalizedTextSchema,
});
export type FinalCta = z.infer<typeof FinalCtaSchema>;

export const WebsitePageCopySchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema,
  offers: z.array(OfferSchema).default([]),
  faqs: z.array(FaqSchema).default([]),
  finalCta: FinalCtaSchema,
});
export type WebsitePageCopy = z.infer<typeof WebsitePageCopySchema>;

export const WebsitePagesContentSchema = z.object({
  ride: WebsitePageCopySchema,
  drive: WebsitePageCopySchema,
});
export type WebsitePagesContent = z.infer<typeof WebsitePagesContentSchema>;

/* ---------- Pricing + service area ---------- */

export const PricingSchema = z.object({
  ratePerKmCents: z.number().int().nonnegative(),
  minFareCents: z.number().int().nonnegative(),
});
export type Pricing = z.infer<typeof PricingSchema>;

export const ServiceCitySchema = z.object({
  id: z.string().min(1),
  name: LocalizedTextSchema,
});
export type ServiceCity = z.infer<typeof ServiceCitySchema>;

export const ServiceAreaSchema = z.object({
  cities: z.array(ServiceCitySchema),
  distancesKm: z.record(z.string(), z.number().nonnegative()),
});
export type ServiceArea = z.infer<typeof ServiceAreaSchema>;

export function distanceKey(cityIdA: string, cityIdB: string): string {
  return [cityIdA, cityIdB].sort().join(':');
}

export function getDistanceKm(area: ServiceArea, a: string, b: string): number | undefined {
  if (a === b) return 0;
  return area.distancesKm[distanceKey(a, b)];
}

/* ---------- Legal ---------- */

export const WebsiteLegalContentSchema = z.object({
  body: LocalizedTextSchema,
});
export type WebsiteLegalContent = z.infer<typeof WebsiteLegalContentSchema>;

/* ---------- Website ---------- */

export const WebsiteContentSchema = z.object({
  hero: WebsiteHeroContentSchema,
  pages: WebsitePagesContentSchema,
  pricing: PricingSchema,
  serviceArea: ServiceAreaSchema,
  impressum: WebsiteLegalContentSchema,
  privacy: WebsiteLegalContentSchema,
});
export type WebsiteContent = z.infer<typeof WebsiteContentSchema>;

export const WebsiteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes'),
  status: WebsiteStatusSchema,
  templateId: WebsiteTemplateIdSchema,
  locales: z.array(WebsiteLocaleSchema).min(1),
  defaultLocale: WebsiteLocaleSchema,
  content: WebsiteContentSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Website = z.infer<typeof WebsiteSchema>;

export const CreateWebsiteInputSchema = z.object({
  name: z.string().min(1),
  templateId: WebsiteTemplateIdSchema,
  locales: z.array(WebsiteLocaleSchema).min(1),
  defaultLocale: WebsiteLocaleSchema,
  status: WebsiteStatusSchema,
});
export type CreateWebsiteInput = z.infer<typeof CreateWebsiteInputSchema>;

export const UpdateWebsiteInputSchema = z
  .object({
    name: z.string().min(1),
    status: WebsiteStatusSchema,
    locales: z.array(WebsiteLocaleSchema).min(1),
    defaultLocale: WebsiteLocaleSchema,
    content: WebsiteContentSchema,
  })
  .partial();
export type UpdateWebsiteInput = z.infer<typeof UpdateWebsiteInputSchema>;

/* ---------- Submissions ---------- */

export const WebsiteSubmissionKindSchema = z.enum(['ride_interest', 'driver_application']);
export type WebsiteSubmissionKind = z.infer<typeof WebsiteSubmissionKindSchema>;

export const RideInterestPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  note: z.string().optional(),
  startCityId: z.string().optional(),
  endCityId: z.string().optional(),
  distanceKm: z.number().nonnegative().optional(),
  estimateCents: z.number().int().nonnegative().optional(),
});
export type RideInterestPayload = z.infer<typeof RideInterestPayloadSchema>;

export const DriverApplicationPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  licenseClass: z.string().min(1),
  note: z.string().optional(),
});
export type DriverApplicationPayload = z.infer<typeof DriverApplicationPayloadSchema>;

export const WebsiteSubmissionSchema = z.object({
  id: z.string().uuid(),
  websiteId: z.string().uuid(),
  kind: WebsiteSubmissionKindSchema,
  locale: WebsiteLocaleSchema,
  payload: z.union([RideInterestPayloadSchema, DriverApplicationPayloadSchema]),
  leadId: z.string().uuid().nullable(),
  candidateId: z.string().uuid().nullable(),
  submittedAt: z.string().datetime(),
});
export type WebsiteSubmission = z.infer<typeof WebsiteSubmissionSchema>;

export const SubmitRideInterestInputSchema = z.object({
  kind: z.literal('ride_interest'),
  locale: WebsiteLocaleSchema,
  payload: RideInterestPayloadSchema,
});
export type SubmitRideInterestInput = z.infer<typeof SubmitRideInterestInputSchema>;

export const SubmitDriverApplicationInputSchema = z.object({
  kind: z.literal('driver_application'),
  locale: WebsiteLocaleSchema,
  payload: DriverApplicationPayloadSchema,
});
export type SubmitDriverApplicationInput = z.infer<typeof SubmitDriverApplicationInputSchema>;

export const SubmitWebsiteInputSchema = z.discriminatedUnion('kind', [
  SubmitRideInterestInputSchema,
  SubmitDriverApplicationInputSchema,
]);
export type SubmitWebsiteInput = z.infer<typeof SubmitWebsiteInputSchema>;

/* ---------- Legal boilerplate ---------- */

const IMPRESSUM_DE = `Angaben gemäß § 5 TMG

[Firmenname]
[Straße und Hausnummer]
[PLZ und Ort]
Deutschland

Vertreten durch: [Vertretungsberechtigte Person]
Handelsregister: [Registergericht, HRB-Nummer]
Umsatzsteuer-ID: [DE-USt-IdNr.]

Kontakt
Telefon: [Telefonnummer]
E-Mail: [E-Mail-Adresse]

Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
[Name], [Anschrift wie oben]

Streitschlichtung
Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`;

const IMPRESSUM_EN = `Legal Notice (§ 5 TMG)

[Company Name]
[Street and Number]
[Postal Code and City]
Germany

Represented by: [Authorised Representative]
Commercial Register: [Court, HRB Number]
VAT ID: [DE VAT Number]

Contact
Phone: [Phone Number]
Email: [Email Address]

Responsible for content according to § 55 (2) RStV:
[Name], [Address as above]

Dispute Resolution
The European Commission provides a platform for online dispute resolution: https://ec.europa.eu/consumers/odr. We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.`;

const PRIVACY_DE = `Datenschutzerklärung

1. Verantwortlicher
Verantwortlich für die Datenverarbeitung auf dieser Website ist:
[Firmenname], [Anschrift], [E-Mail-Adresse].

2. Erhebung und Speicherung personenbezogener Daten
Wir erheben personenbezogene Daten nur, wenn Sie uns diese im Rahmen des Kontaktformulars, einer Fahrtanfrage oder einer Bewerbung als Fahrer:in freiwillig mitteilen. Zu diesen Daten zählen insbesondere Name, E-Mail-Adresse, Telefonnummer und weitere von Ihnen angegebene Informationen.

3. Zweck der Verarbeitung
Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage bzw. Bewerbung verwendet. Eine Weitergabe an Dritte erfolgt nicht ohne Ihre ausdrückliche Einwilligung.

4. Rechtsgrundlage
Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).

5. Speicherdauer
Wir speichern Ihre Daten so lange, wie es zur Bearbeitung Ihrer Anfrage erforderlich ist, längstens jedoch für die Dauer gesetzlicher Aufbewahrungsfristen.

6. Ihre Rechte
Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Zudem können Sie sich bei einer Aufsichtsbehörde beschweren.

7. Kontakt
Für Fragen zum Datenschutz erreichen Sie uns unter: [E-Mail-Adresse].`;

const PRIVACY_EN = `Privacy Policy

1. Data Controller
The party responsible for data processing on this website is:
[Company Name], [Address], [Email Address].

2. Collection and Storage of Personal Data
We only collect personal data if you voluntarily provide it through our contact form, a ride enquiry, or a driver application. This includes in particular your name, email address, phone number, and any other information you submit.

3. Purpose of Processing
Your data is used solely to process your enquiry or application. It will not be shared with third parties without your explicit consent.

4. Legal Basis
Processing is based on Art. 6 (1) (b) GDPR (pre-contractual measures) and Art. 6 (1) (a) GDPR (consent).

5. Retention Period
We retain your data for as long as necessary to process your request, and at most for the duration of statutory retention obligations.

6. Your Rights
You have the right to access, rectify, erase, restrict, port, and object to the processing of your data. You may also lodge a complaint with a supervisory authority.

7. Contact
For questions regarding data protection, contact us at: [Email Address].`;

/**
 * Baseline defaults shared by all templates. Individual templates layer their
 * own hero copy on top via the registry's buildDefaults(templateId, name).
 */
export function baseWebsiteContent(_name: string): WebsiteContent {
  const munichId = 'munich';
  const garchingId = 'garching';
  const freisingId = 'freising';
  return {
    hero: {
      imageUrl: null,
      ctaRideLabel: { de: 'Fahrt berechnen', en: 'Estimate my ride' },
      ctaDriverLabel: { de: 'Jetzt bewerben', en: 'Apply now' },
    },
    pages: {
      ride: {
        headline: { de: 'Ihre Fahrt beginnt hier.', en: 'Your ride starts here.' },
        subheadline: {
          de: 'Sicher, pünktlich, transparent bepreist. Buchen Sie in unter einer Minute.',
          en: 'Safe, on-time, transparently priced. Book in less than a minute.',
        },
        offers: [
          {
            title: { de: 'Feste Preise', en: 'Fixed prices' },
            body: {
              de: 'Sie kennen den Fahrpreis, bevor Sie buchen — kein Surge, keine Überraschungen.',
              en: 'You know the fare before you book — no surge, no surprises.',
            },
          },
          {
            title: { de: 'Geprüfte Fahrer', en: 'Vetted drivers' },
            body: {
              de: 'Jeder Fahrer ist geprüft, versichert und spricht Deutsch und Englisch.',
              en: 'Every driver is background-checked, insured, and speaks English and German.',
            },
          },
          {
            title: { de: 'Rund um die Uhr', en: '24/7 availability' },
            body: {
              de: 'Buchen Sie zu jeder Tageszeit — wir antworten innerhalb weniger Minuten.',
              en: 'Book any time of day — we respond within minutes.',
            },
          },
        ],
        faqs: [
          {
            question: { de: 'Wie wird der Preis berechnet?', en: 'How is the price calculated?' },
            answer: {
              de: 'Distanz × Kilometerpreis, mit einem Mindestpreis für sehr kurze Fahrten. Sie sehen den Preis, bevor Sie buchen.',
              en: 'Distance × per-km rate, with a minimum fare for very short trips. You see the price before you book.',
            },
          },
          {
            question: {
              de: 'Muss ich im Voraus buchen?',
              en: 'Do I need to book in advance?',
            },
            answer: {
              de: 'Nein — die meisten Fahrten disponieren wir innerhalb weniger Minuten.',
              en: 'No — most rides are dispatched within a few minutes.',
            },
          },
          {
            question: { de: 'Welche Städte bedienen Sie?', en: 'Which cities do you serve?' },
            answer: {
              de: 'Alle Strecken im Preisrechner oben. Melden Sie sich, wenn Ihre Stadt fehlt.',
              en: 'All routes are visible in the calculator above. Reach out if your city is missing.',
            },
          },
          {
            question: { de: 'Bekomme ich eine Quittung?', en: 'Do you send a receipt?' },
            answer: {
              de: 'Ja, wir schicken nach jeder Fahrt eine E-Mail-Rechnung.',
              en: 'Yes, we email a receipt after every ride.',
            },
          },
        ],
        finalCta: {
          headline: { de: 'Bereit zu fahren?', en: 'Ready to ride?' },
          subheadline: {
            de: 'Berechnen Sie Ihren Preis in Sekunden.',
            en: 'Get your price in seconds.',
          },
          label: { de: 'Preis berechnen', en: 'Get my price' },
        },
      },
      drive: {
        headline: {
          de: 'Fahren Sie mit uns. Verdienen Sie fair.',
          en: 'Drive with us. Earn fairly.',
        },
        subheadline: {
          de: 'Flexible Schichten, wöchentliche Auszahlung, direkter Draht zur Disposition.',
          en: 'Flexible shifts, weekly payouts, a direct line to dispatch.',
        },
        offers: [
          {
            title: { de: 'Wöchentliche Auszahlung', en: 'Weekly payouts' },
            body: {
              de: 'Verdienst jeden Freitag auf Ihrem Konto — keine versteckten Abzüge.',
              en: 'Earnings on your account every Friday — no hidden deductions.',
            },
          },
          {
            title: { de: 'Flexible Zeiten', en: 'Flexible hours' },
            body: {
              de: 'Sie wählen Ihre Schichten. Fahren Sie, wenn es zu Ihrem Leben passt.',
              en: 'You pick your shifts. Drive when it fits your life.',
            },
          },
          {
            title: { de: 'Support rund um die Uhr', en: '24/7 dispatch' },
            body: {
              de: 'Echte Menschen am anderen Ende der Leitung — Tag und Nacht.',
              en: 'Real people on the other end of the line — day and night.',
            },
          },
        ],
        faqs: [
          {
            question: {
              de: 'Welche Voraussetzungen brauche ich?',
              en: 'What are the requirements?',
            },
            answer: {
              de: 'Gültiger Führerschein, sauberes Führungszeugnis, ein zuverlässiges Fahrzeug. Den Rest erledigen wir.',
              en: 'Valid license, clean record, a reliable vehicle. We handle the rest.',
            },
          },
          {
            question: { de: 'Wie viel kann ich verdienen?', en: 'How much can I earn?' },
            answer: {
              de: 'Hängt von Ihren Stunden und der Nachfrage ab — die meisten Fahrer verdienen 15–25 € pro Stunde.',
              en: 'Depends on your hours and demand — most drivers earn €15–25 per hour.',
            },
          },
          {
            question: { de: 'Wie wird bezahlt?', en: 'How does pay work?' },
            answer: {
              de: 'Fester Betrag pro Fahrt plus Trinkgeld. Keine versteckten Gebühren.',
              en: 'Fixed per-ride pay plus tips. No hidden fees.',
            },
          },
          {
            question: {
              de: 'Wie schnell kann ich starten?',
              en: 'How fast can I start?',
            },
            answer: {
              de: 'In der Regel innerhalb einer Woche nach Ihrer Bewerbung.',
              en: 'Usually within a week of applying.',
            },
          },
        ],
        finalCta: {
          headline: { de: 'Bereit für die Straße?', en: 'Ready to hit the road?' },
          subheadline: {
            de: 'Bewerbung in unter zwei Minuten.',
            en: 'Apply in under two minutes.',
          },
          label: { de: 'Jetzt bewerben', en: 'Apply now' },
        },
      },
    },
    pricing: {
      ratePerKmCents: 250,
      minFareCents: 800,
    },
    serviceArea: {
      cities: [
        { id: munichId, name: { de: 'München', en: 'Munich' } },
        { id: garchingId, name: { de: 'Garching', en: 'Garching' } },
        { id: freisingId, name: { de: 'Freising', en: 'Freising' } },
      ],
      distancesKm: {
        [distanceKey(munichId, garchingId)]: 20,
        [distanceKey(munichId, freisingId)]: 35,
        [distanceKey(garchingId, freisingId)]: 25,
      },
    },
    impressum: { body: { de: IMPRESSUM_DE, en: IMPRESSUM_EN } },
    privacy: { body: { de: PRIVACY_DE, en: PRIVACY_EN } },
  };
}

export function slugifyWebsiteName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

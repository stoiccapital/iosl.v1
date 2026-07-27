import type { WebsiteLocale } from '@factory/shared';

type L = { de: string; en: string };

export const UI_COPY = {
  ride: {
    heading: { de: 'Fahrt anfragen', en: 'Request a ride' } satisfies L,
    name: { de: 'Name', en: 'Name' } satisfies L,
    email: { de: 'E-Mail', en: 'Email' } satisfies L,
    phone: { de: 'Telefon (optional)', en: 'Phone (optional)' } satisfies L,
    city: { de: 'Stadt (optional)', en: 'City (optional)' } satisfies L,
    note: { de: 'Nachricht (optional)', en: 'Message (optional)' } satisfies L,
    submit: { de: 'Anfrage senden', en: 'Send request' } satisfies L,
    success: {
      de: 'Danke! Wir melden uns in Kürze.',
      en: 'Thanks! We will get back to you shortly.',
    } satisfies L,
  },
  driver: {
    heading: { de: 'Als Fahrer bewerben', en: 'Apply as a driver' } satisfies L,
    name: { de: 'Vollständiger Name', en: 'Full name' } satisfies L,
    email: { de: 'E-Mail', en: 'Email' } satisfies L,
    phone: { de: 'Telefon', en: 'Phone' } satisfies L,
    city: { de: 'Stadt', en: 'City' } satisfies L,
    licenseClass: { de: 'Führerscheinklasse', en: 'License class' } satisfies L,
    note: { de: 'Anmerkung (optional)', en: 'Note (optional)' } satisfies L,
    submit: { de: 'Bewerbung senden', en: 'Submit application' } satisfies L,
    success: {
      de: 'Danke! Wir prüfen Ihre Bewerbung.',
      en: 'Thanks! We are reviewing your application.',
    } satisfies L,
  },
  common: {
    impressum: { de: 'Impressum', en: 'Legal notice' } satisfies L,
    privacy: { de: 'Datenschutz', en: 'Privacy' } satisfies L,
    back: { de: 'Zurück', en: 'Back' } satisfies L,
    error: {
      de: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
      en: 'Something went wrong. Please try again.',
    } satisfies L,
    ride: { de: 'Fahrt', en: 'Ride' } satisfies L,
    drive: { de: 'Fahren', en: 'Drive' } satisfies L,
  },
  calc: {
    from: { de: 'Von', en: 'From' } satisfies L,
    to: { de: 'Nach', en: 'To' } satisfies L,
    selectCity: { de: 'Stadt wählen', en: 'Select a city' } satisfies L,
    distance: { de: 'Distanz', en: 'Distance' } satisfies L,
    estimate: { de: 'Preisschätzung', en: 'Estimated price' } satisfies L,
    minFareApplies: { de: 'Mindestpreis', en: 'Minimum fare' } satisfies L,
    samePair: {
      de: 'Bitte wählen Sie zwei unterschiedliche Städte.',
      en: 'Please choose two different cities.',
    } satisfies L,
    noRoute: {
      de: 'Für diese Strecke haben wir noch keinen Preis. Bitte fragen Sie unten an.',
      en: "We don't have a price for this route yet. Please enquire below.",
    } satisfies L,
  },
} as const;

export function t(entry: L, locale: WebsiteLocale): string {
  return entry[locale];
}

export const LICENSE_CLASSES = ['B', 'BE', 'C1', 'C', 'CE', 'D1', 'D'] as const;

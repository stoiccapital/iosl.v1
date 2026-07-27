import {
  baseWebsiteContent,
  type LocalizedText,
  type WebsiteContent,
  type WebsiteTemplateId,
} from '@factory/shared';

type CopyOverrides = {
  ctaRideLabel: LocalizedText;
  ctaDriverLabel: LocalizedText;
  ride: { headline: LocalizedText; subheadline: LocalizedText };
  drive: { headline: LocalizedText; subheadline: LocalizedText };
};

const OVERRIDES: Record<WebsiteTemplateId, CopyOverrides> = {
  'dark-classic': {
    ctaRideLabel: { de: 'Preis berechnen', en: 'Get an estimate' },
    ctaDriverLabel: { de: 'Als Fahrer bewerben', en: 'Apply to drive' },
    ride: {
      headline: {
        de: 'Der letzte Fahrservice, den Sie brauchen.',
        en: "The last ride service you'll need.",
      },
      subheadline: {
        de: 'Feste Preise. Ausgebildete Fahrer. Rund um die Uhr verfügbar.',
        en: 'Fixed prices. Trained drivers. Available around the clock.',
      },
    },
    drive: {
      headline: { de: 'Werden Sie Teil der Flotte.', en: 'Join the fleet.' },
      subheadline: {
        de: 'Wir bezahlen wöchentlich, planen fair und behandeln unsere Fahrer wie Kollegen.',
        en: 'We pay weekly, schedule fairly, and treat our drivers like colleagues.',
      },
    },
  },
  'light-classic': {
    ctaRideLabel: { de: 'Preis anzeigen', en: 'Show my price' },
    ctaDriverLabel: { de: 'Jetzt bewerben', en: 'Apply now' },
    ride: {
      headline: { de: 'Ihr Weg. Unser Auto.', en: 'Your route. Our car.' },
      subheadline: {
        de: 'Ein einfacher Preis, eine ehrliche Fahrt. Wählen Sie Start und Ziel — wir zeigen Ihnen den Rest.',
        en: 'One simple price, one honest ride. Pick your start and destination — we show you the rest.',
      },
    },
    drive: {
      headline: { de: 'Fahren, wenn es Ihnen passt.', en: 'Drive when it suits you.' },
      subheadline: {
        de: 'Flexible Schichten, transparente Bezahlung, ein Team, das Sie unterstützt.',
        en: 'Flexible shifts, transparent pay, a team that has your back.',
      },
    },
  },
  'hero-side': {
    ctaRideLabel: { de: 'Fahrt planen', en: 'Plan my ride' },
    ctaDriverLabel: { de: 'Jetzt bewerben', en: 'Apply now' },
    ride: {
      headline: {
        de: 'Mobilität in der Stadt, neu gedacht.',
        en: 'Mobility in the city, reimagined.',
      },
      subheadline: {
        de: 'Vom Flughafen zur Konferenz, vom Meeting nach Hause. Ohne Umwege, ohne Preisüberraschungen.',
        en: 'Airport to conference, meeting to home. No detours, no price surprises.',
      },
    },
    drive: {
      headline: { de: 'Ihr Auto. Ihre Zeit.', en: 'Your car. Your time.' },
      subheadline: {
        de: 'Steigen Sie ein, wann Sie wollen. Wir kümmern uns um Buchungen, Support und Auszahlung.',
        en: 'Get on the road when you want. We handle bookings, support, and payouts.',
      },
    },
  },
  'hero-below': {
    ctaRideLabel: { de: 'Preis erhalten', en: 'Get my price' },
    ctaDriverLabel: { de: 'Als Fahrer starten', en: 'Start as a driver' },
    ride: {
      headline: { de: 'Von Tür zu Tür — verlässlich.', en: 'Door to door — reliably.' },
      subheadline: {
        de: 'Ein Team, das seit Jahren Passagiere sicher ans Ziel bringt. Buchen Sie eine Fahrt — wir übernehmen den Rest.',
        en: "A team that's been getting passengers to their destination safely for years. Book a ride — we take care of the rest.",
      },
    },
    drive: {
      headline: {
        de: 'Ein besserer Job hinter dem Steuer.',
        en: 'A better job behind the wheel.',
      },
      subheadline: {
        de: 'Wöchentliche Auszahlung, direkter Ansprechpartner, Wertschätzung für gute Arbeit.',
        en: 'Weekly payouts, a direct point of contact, and respect for good work.',
      },
    },
  },
  signature: {
    ctaRideLabel: { de: 'Fahrt buchen', en: 'Book a ride' },
    ctaDriverLabel: { de: 'Als Fahrer starten', en: 'Start driving' },
    ride: {
      headline: { de: 'Fahren Sie mit uns.', en: 'Ride with us.' },
      subheadline: {
        de: 'Zwei Wege zu Ihnen: als Passagier oder als Fahrer. Beide beginnen hier.',
        en: 'Two ways in: as a passenger or as a driver. Both start here.',
      },
    },
    drive: {
      headline: { de: 'Oder fahren Sie für uns.', en: 'Or drive for us.' },
      subheadline: {
        de: 'Wählen Sie die Route, die zu Ihnen passt. Wir bauen die Plattform, Sie bauen Ihr Einkommen.',
        en: 'Pick the route that suits you. We build the platform, you build your income.',
      },
    },
  },
};

export function buildDefaults(id: WebsiteTemplateId, name: string): WebsiteContent {
  const base = baseWebsiteContent(name);
  const o = OVERRIDES[id];
  return {
    ...base,
    hero: {
      ...base.hero,
      ctaRideLabel: o.ctaRideLabel,
      ctaDriverLabel: o.ctaDriverLabel,
    },
    pages: {
      ride: {
        ...base.pages.ride,
        headline: o.ride.headline,
        subheadline: o.ride.subheadline,
      },
      drive: {
        ...base.pages.drive,
        headline: o.drive.headline,
        subheadline: o.drive.subheadline,
      },
    },
  };
}

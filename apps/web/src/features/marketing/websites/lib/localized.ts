import type { LocalizedText, WebsiteLocale } from '@factory/shared';

export function pickLocalized(text: LocalizedText, locale: WebsiteLocale): string {
  const primary = text[locale];
  if (primary && primary.trim().length > 0) return primary;
  const other: WebsiteLocale = locale === 'de' ? 'en' : 'de';
  return text[other] ?? '';
}

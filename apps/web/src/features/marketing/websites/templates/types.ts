import type { Website, WebsiteLocale } from '@factory/shared';

export type TemplateProps = {
  site: Website;
  locale: WebsiteLocale;
  onLocaleChange: (locale: WebsiteLocale) => void;
  /**
   * When true, forms are still rendered but submission is disabled — used by the
   * in-app editor preview so previewers don't accidentally create leads.
   */
  previewMode?: boolean;
};

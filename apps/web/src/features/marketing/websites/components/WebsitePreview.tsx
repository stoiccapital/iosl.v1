import { useState } from 'react';
import type { Website, WebsiteLocale } from '@factory/shared';
import { getTemplate } from '@/features/marketing/websites/templates/registry';
import { cn } from '@/lib/utils';

type Props = { site: Website };

type Page = 'ride' | 'drive';

export function WebsitePreview({ site }: Props) {
  const [locale, setLocale] = useState<WebsiteLocale>(site.defaultLocale);
  const [page, setPage] = useState<Page>('ride');
  const meta = getTemplate(site.templateId);
  const Component = page === 'ride' ? meta.RidePage : meta.DrivePage;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2 text-xs">
        <div className="inline-flex rounded-md border bg-background">
          {(['ride', 'drive'] as Page[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                'px-3 py-1 text-xs font-medium capitalize',
                page === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Preview — nav links + form submissions are inert.
        </span>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <Component site={site} locale={locale} onLocaleChange={setLocale} previewMode />
      </div>
    </div>
  );
}

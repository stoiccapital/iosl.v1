import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { WebsiteLocale, WebsiteTemplateId } from '@factory/shared';
import { slugifyWebsiteName } from '@factory/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCreateWebsite } from '@/features/marketing/websites/hooks';
import { TemplatePicker } from '@/features/marketing/websites/components/TemplatePicker';

export function WebsiteNewPage() {
  const nav = useNavigate();
  const create = useCreateWebsite();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<WebsiteTemplateId>('dark-classic');
  const [locales, setLocales] = useState<WebsiteLocale[]>(['de', 'en']);
  const [defaultLocale, setDefaultLocale] = useState<WebsiteLocale>('de');
  const [publishNow, setPublishNow] = useState(true);

  const slugPreview = useMemo(() => slugifyWebsiteName(name.trim()) || 'your-site', [name]);
  const canCreate = name.trim().length > 0 && !create.isPending;

  function toggleLocale(l: WebsiteLocale, on: boolean) {
    let next = new Set(locales);
    if (on) next.add(l);
    else next.delete(l);
    if (next.size === 0) next = new Set([l]);
    const arr = Array.from(next);
    setLocales(arr);
    if (!arr.includes(defaultLocale)) setDefaultLocale(arr[0]!);
  }

  function onCreate() {
    if (!name.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        templateId,
        locales,
        defaultLocale,
        status: publishNow ? 'published' : 'draft',
      },
      {
        onSuccess: (w) => {
          toast.success('Website created', { description: w.name });
          nav(`/marketing/websites/${w.id}`);
        },
        onError: (e) =>
          toast.error('Could not create', {
            description: e instanceof Error ? e.message : 'Unknown error',
          }),
      },
    );
  }

  return (
    <main className="container max-w-5xl py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">New website</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a template. Copy, image, and legal pages are pre-filled — edit them on the next
          screen.
        </p>
      </header>

      {/* Step 1: Template */}
      <section className="mb-12">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            01
          </span>
          <h2 className="text-base font-medium">Template</h2>
        </div>
        <TemplatePicker value={templateId} onChange={setTemplateId} />
      </section>

      <Separator />

      {/* Step 2: Details */}
      <section className="my-12 space-y-8">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            02
          </span>
          <h2 className="text-base font-medium">Details</h2>
        </div>

        <div className="max-w-xl space-y-2">
          <Label htmlFor="new-name" className="text-xs">
            Name
          </Label>
          <Input
            id="new-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fahrly Berlin"
          />
          <p className="pt-1 text-xs text-muted-foreground font-mono tabular-nums">
            /sites/{slugPreview}/{defaultLocale}/ride
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs">Languages</Label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={locales.includes('de')}
                onCheckedChange={(v: boolean) => toggleLocale('de', v === true)}
              />
              German (DE)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={locales.includes('en')}
                onCheckedChange={(v: boolean) => toggleLocale('en', v === true)}
              />
              English (EN)
            </label>
          </div>
        </div>

        {locales.length > 1 && (
          <div className="space-y-3">
            <Label className="text-xs">Default</Label>
            <div className="inline-flex rounded-md border">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setDefaultLocale(l)}
                  className={`px-4 py-2 text-xs font-mono uppercase tabular-nums ${
                    defaultLocale === l ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-4 border-t bg-background/95 px-4 py-4 backdrop-blur">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={publishNow}
            onCheckedChange={(v: boolean) => setPublishNow(v === true)}
          />
          Publish immediately
        </label>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => nav('/marketing/websites')}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={!canCreate}>
            {create.isPending ? 'Creating…' : 'Create website'}
          </Button>
        </div>
      </div>
    </main>
  );
}

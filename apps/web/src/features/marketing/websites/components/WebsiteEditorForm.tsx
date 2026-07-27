import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type {
  LocalizedText,
  ServiceArea,
  ServiceCity,
  Website,
  WebsiteContent,
  WebsiteLocale,
  WebsitePageCopy,
  WebsiteStatus,
} from '@factory/shared';
import { distanceKey } from '@factory/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useUpdateWebsite } from '@/features/marketing/websites/hooks';
import { centsToEurString, eurStringToCents } from '@/features/marketing/websites/lib/pricing';
import { PageCopyEditor } from './PageCopyEditor';

const MAX_IMAGE_BYTES = 500 * 1024;

type Props = {
  site: Website;
};

export function WebsiteEditorForm({ site }: Props) {
  const [draft, setDraft] = useState(site);
  const dirty = JSON.stringify(draft) !== JSON.stringify(site);
  const update = useUpdateWebsite(site.id);

  useEffect(() => {
    setDraft(site);
  }, [site]);

  function patchDraft(patch: Partial<Website>) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function patchContent(patch: Partial<WebsiteContent>) {
    setDraft((d) => ({ ...d, content: { ...d.content, ...patch } }));
  }
  function patchHero(patch: Partial<Website['content']['hero']>) {
    patchContent({ hero: { ...draft.content.hero, ...patch } });
  }
  function patchPageCopy(page: 'ride' | 'drive', patch: Partial<WebsitePageCopy>) {
    patchContent({
      pages: {
        ...draft.content.pages,
        [page]: { ...draft.content.pages[page], ...patch },
      },
    });
  }

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image too large', { description: 'Max 500 KB in MVP.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        patchHero({ imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function toggleLocale(loc: WebsiteLocale, checked: boolean) {
    let next = new Set(draft.locales);
    if (checked) next.add(loc);
    else next.delete(loc);
    if (next.size === 0) next = new Set([loc]);
    const nextArr = Array.from(next);
    const nextDefault = nextArr.includes(draft.defaultLocale) ? draft.defaultLocale : nextArr[0]!;
    patchDraft({ locales: nextArr, defaultLocale: nextDefault });
  }

  function onSave() {
    update.mutate(
      {
        name: draft.name,
        status: draft.status,
        locales: draft.locales,
        defaultLocale: draft.defaultLocale,
        content: draft.content,
      },
      {
        onSuccess: () => toast.success('Website saved'),
        onError: (e) =>
          toast.error('Could not save', {
            description: e instanceof Error ? e.message : 'Unknown error',
          }),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Basics */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={draft.slug} disabled className="font-mono tabular-nums" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label className="text-sm">Published</Label>
            <p className="text-xs text-muted-foreground">
              When published, the site is reachable at /sites/{draft.slug}.
            </p>
          </div>
          <Switch
            checked={draft.status === 'published'}
            onCheckedChange={(v: boolean) =>
              patchDraft({ status: (v ? 'published' : 'draft') satisfies WebsiteStatus })
            }
          />
        </div>
      </section>

      <Separator />

      {/* Languages */}
      <section className="space-y-3">
        <div>
          <Label className="text-sm">Languages</Label>
          <p className="text-xs text-muted-foreground">Pick DE, EN, or both.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draft.locales.includes('de')}
              onCheckedChange={(v: boolean) => toggleLocale('de', v === true)}
            />
            German (DE)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draft.locales.includes('en')}
              onCheckedChange={(v: boolean) => toggleLocale('en', v === true)}
            />
            English (EN)
          </label>
        </div>
      </section>

      {draft.locales.length > 1 && (
        <section className="space-y-6">
          <Label className="text-sm">Default</Label>
          <div className="inline-flex rounded-md border">
            {draft.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => patchDraft({ defaultLocale: l })}
                className={`px-3 py-1.5 text-xs font-mono tabular-nums uppercase ${
                  draft.defaultLocale === l ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Hero image */}
      <section className="space-y-3">
        <div>
          <Label className="text-sm">Hero image</Label>
          <p className="text-xs text-muted-foreground">
            Shared across ride + drive pages. Max 500 KB. PNG or JPG.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-24 w-32 overflow-hidden rounded-md border bg-muted">
            {draft.content.hero.imageUrl ? (
              <img
                src={draft.content.hero.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input type="file" accept="image/png,image/jpeg" onChange={onImageChange} />
            {draft.content.hero.imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => patchHero({ imageUrl: null })}
              >
                Remove image
              </Button>
            )}
          </div>
        </div>
      </section>

      <Separator />

      <PageCopyEditor
        title="Ride page"
        page={draft.content.pages.ride}
        ctaLabel={draft.content.hero.ctaRideLabel}
        locales={draft.locales}
        onChange={(patch) => patchPageCopy('ride', patch)}
        onCtaLabelChange={(next) => patchHero({ ctaRideLabel: next })}
      />

      <Separator />

      <PageCopyEditor
        title="Drive page"
        page={draft.content.pages.drive}
        ctaLabel={draft.content.hero.ctaDriverLabel}
        locales={draft.locales}
        onChange={(patch) => patchPageCopy('drive', patch)}
        onCtaLabelChange={(next) => patchHero({ ctaDriverLabel: next })}
      />

      <Separator />

      {/* Pricing */}
      <section className="space-y-3">
        <div>
          <Label className="text-sm">Pricing</Label>
          <p className="text-xs text-muted-foreground">
            Visitors see distance × rate on the ride page. Minimum fare kicks in for very short
            trips.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CurrencyField
            label="Rate per km (€)"
            valueCents={draft.content.pricing.ratePerKmCents}
            onChange={(c) =>
              patchContent({ pricing: { ...draft.content.pricing, ratePerKmCents: c } })
            }
          />
          <CurrencyField
            label="Minimum fare (€)"
            valueCents={draft.content.pricing.minFareCents}
            onChange={(c) =>
              patchContent({ pricing: { ...draft.content.pricing, minFareCents: c } })
            }
          />
        </div>
      </section>

      <Separator />

      {/* Service area */}
      <ServiceAreaEditor
        area={draft.content.serviceArea}
        locales={draft.locales}
        onChange={(area) => patchContent({ serviceArea: area })}
      />

      <Separator />

      <section className="space-y-3">
        <Label className="text-sm">Impressum</Label>
        <LocalizedFieldGroup
          locales={draft.locales}
          fields={[
            {
              label: 'Impressum body',
              value: draft.content.impressum.body,
              onChange: (loc, v) =>
                patchContent({
                  impressum: { body: { ...draft.content.impressum.body, [loc]: v } },
                }),
              kind: 'textarea',
              rows: 12,
            },
          ]}
        />
      </section>

      <Separator />

      <section className="space-y-3">
        <Label className="text-sm">Datenschutz / Privacy</Label>
        <LocalizedFieldGroup
          locales={draft.locales}
          fields={[
            {
              label: 'Privacy body',
              value: draft.content.privacy.body,
              onChange: (loc, v) =>
                patchContent({
                  privacy: { body: { ...draft.content.privacy.body, [loc]: v } },
                }),
              kind: 'textarea',
              rows: 12,
            },
          ]}
        />
      </section>

      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <p className="mr-auto text-xs text-muted-foreground">
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </p>
        <Button variant="ghost" onClick={() => setDraft(site)} disabled={!dirty || update.isPending}>
          Discard
        </Button>
        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Currency field ---------- */

function CurrencyField({
  label,
  valueCents,
  onChange,
}: {
  label: string;
  valueCents: number;
  onChange: (cents: number) => void;
}) {
  const [text, setText] = useState(centsToEurString(valueCents));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(centsToEurString(valueCents));
  }, [valueCents]);

  function commit(next: string) {
    setText(next);
    const parsed = eurStringToCents(next);
    if (parsed === null) {
      setError('Enter a valid amount, e.g. 2,50');
      return;
    }
    setError(null);
    if (parsed !== valueCents) onChange(parsed);
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        value={text}
        onChange={(e) => commit(e.target.value)}
        className="font-mono tabular-nums"
        inputMode="decimal"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ---------- Service area editor ---------- */

function ServiceAreaEditor({
  area,
  locales,
  onChange,
}: {
  area: ServiceArea;
  locales: WebsiteLocale[];
  onChange: (area: ServiceArea) => void;
}) {
  function updateCity(id: string, patch: Partial<ServiceCity>) {
    onChange({
      ...area,
      cities: area.cities.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }
  function updateCityName(id: string, loc: WebsiteLocale, value: string) {
    const c = area.cities.find((x) => x.id === id);
    if (!c) return;
    updateCity(id, { name: { ...c.name, [loc]: value } });
  }
  function addCity() {
    const id = crypto.randomUUID().slice(0, 8);
    onChange({
      ...area,
      cities: [...area.cities, { id, name: { de: '', en: '' } }],
    });
  }
  function removeCity(id: string) {
    const nextCities = area.cities.filter((c) => c.id !== id);
    const nextDistances: Record<string, number> = {};
    for (const [k, v] of Object.entries(area.distancesKm)) {
      const [a, b] = k.split(':');
      if (a !== id && b !== id) nextDistances[k] = v;
    }
    onChange({ cities: nextCities, distancesKm: nextDistances });
  }
  function setDistance(a: string, b: string, km: number | null) {
    const key = distanceKey(a, b);
    const next = { ...area.distancesKm };
    if (km === null || km <= 0) delete next[key];
    else next[key] = km;
    onChange({ ...area, distancesKm: next });
  }

  const pairs: { a: ServiceCity; b: ServiceCity; key: string }[] = [];
  for (let i = 0; i < area.cities.length; i++) {
    for (let j = i + 1; j < area.cities.length; j++) {
      const a = area.cities[i]!;
      const b = area.cities[j]!;
      pairs.push({ a, b, key: distanceKey(a.id, b.id) });
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <Label className="text-sm">Service area</Label>
        <p className="text-xs text-muted-foreground">
          Cities the calculator offers, and the driving distance between every pair.
        </p>
      </div>

      <div className="space-y-2">
        {area.cities.map((c) => (
          <div
            key={c.id}
            className="grid gap-2 rounded-md border p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center"
          >
            <span className="text-[10px] font-mono uppercase text-muted-foreground">
              #{c.id.slice(0, 6)}
            </span>
            {locales.includes('de') && (
              <div className="space-y-1">
                <Label className="text-xs">DE</Label>
                <Input
                  value={c.name.de}
                  onChange={(e) => updateCityName(c.id, 'de', e.target.value)}
                  placeholder="München"
                />
              </div>
            )}
            {locales.includes('en') && (
              <div className="space-y-1">
                <Label className="text-xs">EN</Label>
                <Input
                  value={c.name.en}
                  onChange={(e) => updateCityName(c.id, 'en', e.target.value)}
                  placeholder="Munich"
                />
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => removeCity(c.id)} title="Remove">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addCity} className="gap-2">
          <Plus className="h-4 w-4" />
          Add city
        </Button>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Distances (km)</Label>
          <div className="rounded-md border">
            {pairs.map(({ a, b, key }) => {
              const value = area.distancesKm[key] ?? '';
              const labelA = a.name.de || a.name.en || `#${a.id.slice(0, 4)}`;
              const labelB = b.name.de || b.name.en || `#${b.id.slice(0, 4)}`;
              return (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-2 last:border-b-0"
                >
                  <span className="text-sm">
                    {labelA} <span className="text-muted-foreground">↔</span> {labelB}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.1"
                      value={value === '' ? '' : String(value)}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        if (v === '') setDistance(a.id, b.id, null);
                        else {
                          const n = Number.parseFloat(v);
                          if (Number.isFinite(n)) setDistance(a.id, b.id, n);
                        }
                      }}
                      className="w-24 font-mono tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Localized field group ---------- */

type LocalizedField = {
  label: string;
  value: LocalizedText;
  onChange: (locale: WebsiteLocale, value: string) => void;
  kind: 'input' | 'textarea';
  rows?: number;
};

function LocalizedFieldGroup({
  locales,
  fields,
}: {
  locales: WebsiteLocale[];
  fields: LocalizedField[];
}) {
  if (locales.length === 1) {
    const loc = locales[0]!;
    return (
      <div className="grid gap-3">
        {fields.map((f) => (
          <FieldRow key={f.label} field={f} value={f.value[loc] ?? ''} onChange={(v) => f.onChange(loc, v)} />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue={locales[0]!} className="w-full">
      <TabsList>
        {locales.map((l) => (
          <TabsTrigger key={l} value={l} className="font-mono tabular-nums uppercase">
            {l}
          </TabsTrigger>
        ))}
      </TabsList>
      {locales.map((l) => (
        <TabsContent key={l} value={l} className="mt-3 grid gap-3">
          {fields.map((f) => (
            <FieldRow key={f.label} field={f} value={f.value[l] ?? ''} onChange={(v) => f.onChange(l, v)} />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: LocalizedField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{field.label}</Label>
      {field.kind === 'textarea' ? (
        <Textarea
          rows={field.rows ?? 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

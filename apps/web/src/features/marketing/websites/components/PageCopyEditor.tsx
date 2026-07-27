import { Plus, Trash2 } from 'lucide-react';
import type {
  Faq,
  FinalCta,
  LocalizedText,
  Offer,
  WebsiteLocale,
  WebsitePageCopy,
} from '@factory/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EMPTY_L: LocalizedText = { de: '', en: '' };

type Props = {
  title: string;
  page: WebsitePageCopy;
  ctaLabel: LocalizedText;
  locales: WebsiteLocale[];
  onChange: (patch: Partial<WebsitePageCopy>) => void;
  onCtaLabelChange: (next: LocalizedText) => void;
};

export function PageCopyEditor({
  title,
  page,
  ctaLabel,
  locales,
  onChange,
  onCtaLabelChange,
}: Props) {
  function patchLocalized(field: 'headline' | 'subheadline', loc: WebsiteLocale, v: string) {
    onChange({ [field]: { ...page[field], [loc]: v } });
  }

  return (
    <section className="space-y-5">
      <Label className="text-sm">{title}</Label>

      <LocalizedFieldGroup
        locales={locales}
        fields={[
          {
            label: 'Headline',
            value: page.headline,
            onChange: (loc, v) => patchLocalized('headline', loc, v),
            kind: 'input',
          },
          {
            label: 'Subheadline',
            value: page.subheadline,
            onChange: (loc, v) => patchLocalized('subheadline', loc, v),
            kind: 'textarea',
          },
          {
            label: 'Primary CTA label',
            value: ctaLabel,
            onChange: (loc, v) => onCtaLabelChange({ ...ctaLabel, [loc]: v }),
            kind: 'input',
          },
        ]}
      />

      <OffersEditor
        offers={page.offers}
        locales={locales}
        onChange={(next) => onChange({ offers: next })}
      />

      <FaqsEditor
        faqs={page.faqs}
        locales={locales}
        onChange={(next) => onChange({ faqs: next })}
      />

      <FinalCtaEditor
        cta={page.finalCta}
        locales={locales}
        onChange={(next) => onChange({ finalCta: next })}
      />
    </section>
  );
}

/* ---------- Offers ---------- */

function OffersEditor({
  offers,
  locales,
  onChange,
}: {
  offers: Offer[];
  locales: WebsiteLocale[];
  onChange: (next: Offer[]) => void;
}) {
  function update(i: number, patch: Partial<Offer>) {
    onChange(offers.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  function updateField(i: number, field: 'title' | 'body', loc: WebsiteLocale, v: string) {
    const current = offers[i]![field];
    update(i, { [field]: { ...current, [loc]: v } });
  }
  function add() {
    onChange([...offers, { title: { ...EMPTY_L }, body: { ...EMPTY_L } }]);
  }
  function remove(i: number) {
    onChange(offers.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Offers</Label>
        <Button variant="outline" size="sm" onClick={add} className="gap-2">
          <Plus className="h-4 w-4" />
          Add offer
        </Button>
      </div>
      {offers.length === 0 ? (
        <p className="text-xs text-muted-foreground">No offers.</p>
      ) : (
        <div className="space-y-2">
          {offers.map((o, i) => (
            <div key={i} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Offer #{i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <LocalizedFieldGroup
                locales={locales}
                fields={[
                  {
                    label: 'Title',
                    value: o.title,
                    onChange: (loc, v) => updateField(i, 'title', loc, v),
                    kind: 'input',
                  },
                  {
                    label: 'Body',
                    value: o.body,
                    onChange: (loc, v) => updateField(i, 'body', loc, v),
                    kind: 'textarea',
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- FAQs ---------- */

function FaqsEditor({
  faqs,
  locales,
  onChange,
}: {
  faqs: Faq[];
  locales: WebsiteLocale[];
  onChange: (next: Faq[]) => void;
}) {
  function update(i: number, patch: Partial<Faq>) {
    onChange(faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function updateField(i: number, field: 'question' | 'answer', loc: WebsiteLocale, v: string) {
    const current = faqs[i]![field];
    update(i, { [field]: { ...current, [loc]: v } });
  }
  function add() {
    onChange([...faqs, { question: { ...EMPTY_L }, answer: { ...EMPTY_L } }]);
  }
  function remove(i: number) {
    onChange(faqs.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Q&amp;A</Label>
        <Button variant="outline" size="sm" onClick={add} className="gap-2">
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>
      {faqs.length === 0 ? (
        <p className="text-xs text-muted-foreground">No questions.</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Q #{i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <LocalizedFieldGroup
                locales={locales}
                fields={[
                  {
                    label: 'Question',
                    value: f.question,
                    onChange: (loc, v) => updateField(i, 'question', loc, v),
                    kind: 'input',
                  },
                  {
                    label: 'Answer',
                    value: f.answer,
                    onChange: (loc, v) => updateField(i, 'answer', loc, v),
                    kind: 'textarea',
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Final CTA ---------- */

function FinalCtaEditor({
  cta,
  locales,
  onChange,
}: {
  cta: FinalCta;
  locales: WebsiteLocale[];
  onChange: (next: FinalCta) => void;
}) {
  function patch(field: keyof FinalCta, loc: WebsiteLocale, v: string) {
    onChange({ ...cta, [field]: { ...cta[field], [loc]: v } });
  }
  return (
    <div className="space-y-2">
      <Label className="text-xs">Final CTA</Label>
      <LocalizedFieldGroup
        locales={locales}
        fields={[
          {
            label: 'Headline',
            value: cta.headline,
            onChange: (loc, v) => patch('headline', loc, v),
            kind: 'input',
          },
          {
            label: 'Subheadline',
            value: cta.subheadline,
            onChange: (loc, v) => patch('subheadline', loc, v),
            kind: 'textarea',
          },
          {
            label: 'Button label',
            value: cta.label,
            onChange: (loc, v) => patch('label', loc, v),
            kind: 'input',
          },
        ]}
      />
    </div>
  );
}

/* ---------- Localized field group (shared) ---------- */

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

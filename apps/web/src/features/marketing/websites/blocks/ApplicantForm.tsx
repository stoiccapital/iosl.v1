import { useState, type FormEvent } from 'react';
import type { WebsiteLocale } from '@factory/shared';
import { useSubmitToSite } from '@/features/marketing/websites/hooks';
import { LICENSE_CLASSES, UI_COPY, t } from '@/features/marketing/websites/lib/copy';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

type Props = {
  slug: string;
  locale: WebsiteLocale;
  theme: Theme;
  ctaLabel: string;
  className?: string;
};

const inputBase =
  'w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2';

const inputTheme: Record<Theme, string> = {
  dark: 'border-neutral-800 bg-neutral-800 text-white placeholder:text-neutral-500 focus:ring-white/40',
  light: 'border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:ring-neutral-900/30',
};

const labelTheme: Record<Theme, string> = {
  dark: 'text-neutral-400',
  light: 'text-neutral-600',
};

const errorTheme: Record<Theme, string> = {
  dark: 'text-red-300',
  light: 'text-red-600',
};

const successTheme: Record<Theme, string> = {
  dark: 'text-emerald-300',
  light: 'text-emerald-700',
};

export function ApplicantForm({ slug, locale, theme, ctaLabel, className }: Props) {
  const submit = useSubmitToSite(slug);
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    licenseClass: 'B',
    note: '',
  });
  const [done, setDone] = useState(false);

  function onChange<K extends keyof typeof values>(key: K, v: string) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        kind: 'driver_application',
        locale,
        payload: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          city: values.city.trim(),
          licenseClass: values.licenseClass,
          note: values.note.trim() || undefined,
        },
      });
      setDone(true);
      setValues({ name: '', email: '', phone: '', city: '', licenseClass: 'B', note: '' });
    } catch {
      /* handled via submit.isError below */
    }
  }

  if (done) {
    return (
      <p className={cn('text-sm', successTheme[theme], className)}>
        {t(UI_COPY.driver.success, locale)}
      </p>
    );
  }

  const c = UI_COPY.driver;
  return (
    <form onSubmit={onSubmit} className={cn('flex flex-col gap-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t(c.name, locale)} theme={theme}>
          <input
            type="text"
            required
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={cn(inputBase, inputTheme[theme])}
          />
        </Field>
        <Field label={t(c.email, locale)} theme={theme}>
          <input
            type="email"
            required
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={cn(inputBase, inputTheme[theme])}
          />
        </Field>
        <Field label={t(c.phone, locale)} theme={theme}>
          <input
            type="tel"
            required
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={cn(inputBase, inputTheme[theme])}
          />
        </Field>
        <Field label={t(c.city, locale)} theme={theme}>
          <input
            type="text"
            required
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={cn(inputBase, inputTheme[theme])}
          />
        </Field>
        <Field label={t(c.licenseClass, locale)} theme={theme}>
          <select
            required
            value={values.licenseClass}
            onChange={(e) => onChange('licenseClass', e.target.value)}
            className={cn(inputBase, inputTheme[theme], 'font-mono tabular-nums')}
          >
            {LICENSE_CLASSES.map((lc) => (
              <option key={lc} value={lc}>
                {lc}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t(c.note, locale)} theme={theme}>
        <textarea
          rows={3}
          value={values.note}
          onChange={(e) => onChange('note', e.target.value)}
          className={cn(inputBase, inputTheme[theme])}
        />
      </Field>
      {submit.isError && (
        <p className={cn('text-xs', errorTheme[theme])}>{t(UI_COPY.common.error, locale)}</p>
      )}
      <button
        type="submit"
        disabled={submit.isPending}
        className={cn(
          'inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition disabled:opacity-60',
          theme === 'dark'
            ? 'bg-white text-neutral-900 hover:bg-white/90'
            : 'bg-neutral-900 text-white hover:bg-neutral-800',
        )}
      >
        {submit.isPending ? '…' : ctaLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={cn('text-xs font-medium', labelTheme[theme])}>{label}</span>
      {children}
    </label>
  );
}

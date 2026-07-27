import type { WebsiteTemplateId } from '@factory/shared';
import { cn } from '@/lib/utils';
import { TEMPLATE_REGISTRY, type TemplateMeta } from '@/features/marketing/websites/templates/registry';

type Props = {
  value: WebsiteTemplateId;
  onChange: (id: WebsiteTemplateId) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATE_REGISTRY.map((meta) => {
        const active = meta.id === value;
        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => onChange(meta.id)}
            className={cn(
              'group flex flex-col overflow-hidden rounded-lg border text-left transition',
              active
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-border hover:border-primary/60',
            )}
          >
            <TemplateSkeleton meta={meta} />
            <div className="border-t p-3">
              <p className="text-sm font-medium">{meta.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TemplateSkeleton({ meta }: { meta: TemplateMeta }) {
  const isDark = meta.theme === 'dark';
  const bg = isDark ? 'bg-neutral-900' : 'bg-neutral-50';
  const bar = isDark ? 'bg-white/60' : 'bg-neutral-500';
  const image = isDark ? 'bg-white/10' : 'bg-neutral-300';

  switch (meta.id) {
    case 'dark-classic':
    case 'light-classic':
      return (
        <div className={cn('flex h-32 flex-col justify-between p-3', bg)}>
          <div className="space-y-1.5">
            <div className={cn('h-2 w-3/5 rounded-sm', bar)} />
            <div className={cn('h-1.5 w-2/5 rounded-sm opacity-60', bar)} />
          </div>
          <div className={cn('h-10 w-full rounded-sm', image)} />
        </div>
      );

    case 'hero-side':
      return (
        <div className={cn('grid h-32 grid-cols-[1.1fr_1fr] gap-3 p-3', bg)}>
          <div className="flex flex-col justify-center space-y-1.5">
            <div className={cn('h-2 w-full rounded-sm', bar)} />
            <div className={cn('h-1.5 w-3/4 rounded-sm opacity-60', bar)} />
          </div>
          <div className={cn('rounded-sm', image)} />
        </div>
      );

    case 'hero-below':
      return (
        <div className="flex h-32 flex-col justify-between bg-gradient-to-b from-amber-50 to-neutral-50 p-3">
          <div className="space-y-1.5">
            <div className="h-1 w-1/5 rounded-sm bg-amber-500" />
            <div className="h-2 w-3/5 rounded-sm bg-neutral-500" />
            <div className="h-1.5 w-2/5 rounded-sm bg-neutral-400/70" />
          </div>
          <div className="h-8 w-full rounded-sm bg-neutral-300" />
        </div>
      );

    case 'signature':
      return (
        <div className="grid h-32 grid-cols-2 gap-2 bg-neutral-900 p-3">
          <div className="rounded-sm bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-90" />
          <div className="rounded-sm bg-white/10" />
        </div>
      );
  }
}

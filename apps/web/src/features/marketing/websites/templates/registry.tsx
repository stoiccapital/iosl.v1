import type { ComponentType } from 'react';
import type { WebsiteTemplateId } from '@factory/shared';
import { DarkClassicDrivePage, DarkClassicRidePage } from './DarkClassic';
import { HeroBelowDrivePage, HeroBelowRidePage } from './HeroBelow';
import { HeroSideDrivePage, HeroSideRidePage } from './HeroSide';
import { LightClassicDrivePage, LightClassicRidePage } from './LightClassic';
import { SignatureDrivePage, SignatureRidePage } from './Signature';
import type { TemplateProps } from './types';

export type TemplateMeta = {
  id: WebsiteTemplateId;
  name: string;
  description: string;
  theme: 'dark' | 'light';
  RidePage: ComponentType<TemplateProps>;
  DrivePage: ComponentType<TemplateProps>;
};

export const TEMPLATE_REGISTRY: TemplateMeta[] = [
  {
    id: 'dark-classic',
    name: 'Dark',
    description: 'Editorial dark theme. Centered hero with image below.',
    theme: 'dark',
    RidePage: DarkClassicRidePage,
    DrivePage: DarkClassicDrivePage,
  },
  {
    id: 'light-classic',
    name: 'Light',
    description: 'Minimal light theme. Centered hero with image below.',
    theme: 'light',
    RidePage: LightClassicRidePage,
    DrivePage: LightClassicDrivePage,
  },
  {
    id: 'hero-side',
    name: 'Hero — Side',
    description: 'Image next to the headline. Balanced two-column layout.',
    theme: 'light',
    RidePage: HeroSideRidePage,
    DrivePage: HeroSideDrivePage,
  },
  {
    id: 'hero-below',
    name: 'Hero — Below',
    description: 'Warm amber accent. Headline left-aligned, image below.',
    theme: 'light',
    RidePage: HeroBelowRidePage,
    DrivePage: HeroBelowDrivePage,
  },
  {
    id: 'signature',
    name: 'Signature (split)',
    description: 'Split-screen. Rider and driver funnels visible from the start.',
    theme: 'dark',
    RidePage: SignatureRidePage,
    DrivePage: SignatureDrivePage,
  },
];

export function getTemplate(id: WebsiteTemplateId): TemplateMeta {
  const meta = TEMPLATE_REGISTRY.find((m) => m.id === id);
  if (!meta) throw new Error(`Unknown template id: ${id}`);
  return meta;
}

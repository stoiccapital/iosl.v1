import { z } from 'zod';
import {
  FeatureSchema,
  IncidentSchema,
  ReleaseSchema,
  type CreateFeatureInput,
  type CreateIncidentInput,
  type CreateReleaseInput,
  type Feature,
  type Incident,
  type Release,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const featureHooks = makeResourceHooks<Feature, CreateFeatureInput, Partial<CreateFeatureInput>>({
  base: '/features',
  domain: 'features',
  itemSchema: FeatureSchema,
  listSchema: z.array(FeatureSchema),
});

export const releaseHooks = makeResourceHooks<Release, CreateReleaseInput, Partial<CreateReleaseInput>>({
  base: '/releases',
  domain: 'releases',
  itemSchema: ReleaseSchema,
  listSchema: z.array(ReleaseSchema),
});

export const incidentHooks = makeResourceHooks<Incident, CreateIncidentInput, Partial<CreateIncidentInput>>({
  base: '/incidents',
  domain: 'incidents',
  itemSchema: IncidentSchema,
  listSchema: z.array(IncidentSchema),
});

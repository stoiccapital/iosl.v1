import { z } from 'zod';
import {
  DeviceSchema,
  SoftwareLicenseSchema,
  type CreateDeviceInput,
  type CreateSoftwareLicenseInput,
  type Device,
  type SoftwareLicense,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const deviceHooks = makeResourceHooks<Device, CreateDeviceInput, Partial<CreateDeviceInput>>({
  base: '/devices',
  domain: 'devices',
  itemSchema: DeviceSchema,
  listSchema: z.array(DeviceSchema),
});

export const softwareLicenseHooks = makeResourceHooks<
  SoftwareLicense,
  CreateSoftwareLicenseInput,
  Partial<CreateSoftwareLicenseInput>
>({
  base: '/software-licenses',
  domain: 'software-licenses',
  itemSchema: SoftwareLicenseSchema,
  listSchema: z.array(SoftwareLicenseSchema),
});

import { z } from 'zod';
import {
  ContractSchema,
  SupplierSchema,
  type Contract,
  type CreateContractInput,
  type CreateSupplierInput,
  type Supplier,
} from '@factory/shared';
import { makeResourceHooks } from '@/lib/crud-hooks';

export const supplierHooks = makeResourceHooks<
  Supplier,
  CreateSupplierInput,
  Partial<CreateSupplierInput>
>({
  base: '/suppliers',
  domain: 'suppliers',
  itemSchema: SupplierSchema,
  listSchema: z.array(SupplierSchema),
});

export const contractHooks = makeResourceHooks<
  Contract,
  CreateContractInput,
  Partial<CreateContractInput>
>({
  base: '/contracts',
  domain: 'contracts',
  itemSchema: ContractSchema,
  listSchema: z.array(ContractSchema),
});

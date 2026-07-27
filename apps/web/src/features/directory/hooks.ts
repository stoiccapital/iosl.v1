import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  PersonSchema,
  PersonTypeSchema,
  ProductSchema,
  type Person,
  type PersonType,
  type Product,
} from '@factory/shared';
import { api } from '@/lib/api-client';

const peopleListSchema = z.array(PersonSchema);
const productListSchema = z.array(ProductSchema);

export function usePeople(type?: PersonType) {
  return useQuery<Person[]>({
    queryKey: ['people', 'list', type ?? 'all'],
    queryFn: async () => {
      const suffix = type ? `?type=${PersonTypeSchema.parse(type)}` : '';
      return peopleListSchema.parse(await api.get<unknown>(`/people${suffix}`));
    },
  });
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'list'],
    queryFn: async () => productListSchema.parse(await api.get<unknown>('/products')),
  });
}

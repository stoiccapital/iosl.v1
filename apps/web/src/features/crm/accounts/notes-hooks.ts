import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  AccountContactNoteSchema,
  AccountContactSchema,
  AccountNoteSchema,
  type AccountContact,
  type AccountContactNote,
  type AccountNote,
  type CreateAccountContactInput,
} from '@factory/shared';
import { api } from '@/lib/api-client';

const accountNotesListSchema = z.array(AccountNoteSchema);
const accountContactsListSchema = z.array(AccountContactSchema);
const accountContactNotesListSchema = z.array(AccountContactNoteSchema);

/* -------- Account notes (timestamped, append-only) -------- */

export function useAccountNotes(accountId: string | undefined) {
  return useQuery<AccountNote[]>({
    queryKey: ['account-notes', 'list', accountId ?? 'noop'],
    queryFn: async () =>
      accountNotesListSchema.parse(await api.get<unknown>(`/accounts/${accountId}/notes`)),
    enabled: Boolean(accountId),
  });
}

export function useCreateAccountNote(accountId: string) {
  const qc = useQueryClient();
  return useMutation<AccountNote, Error, { body: string }>({
    mutationFn: async ({ body }) =>
      AccountNoteSchema.parse(await api.post<unknown>(`/accounts/${accountId}/notes`, { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['account-notes', 'list', accountId] }),
  });
}

/* -------- Account contacts -------- */

export function useAccountContacts(accountId: string | undefined) {
  return useQuery<AccountContact[]>({
    queryKey: ['account-contacts', 'list', accountId ?? 'noop'],
    queryFn: async () =>
      accountContactsListSchema.parse(
        await api.get<unknown>(`/accounts/${accountId}/contacts`),
      ),
    enabled: Boolean(accountId),
  });
}

export function useCreateAccountContact(accountId: string) {
  const qc = useQueryClient();
  return useMutation<AccountContact, Error, Omit<CreateAccountContactInput, 'accountId'>>({
    mutationFn: async (input) =>
      AccountContactSchema.parse(
        await api.post<unknown>(`/accounts/${accountId}/contacts`, input),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['account-contacts', 'list', accountId] }),
  });
}

type UpdateAccountContactInput = Partial<
  Pick<
    AccountContact,
    'firstName' | 'lastName' | 'title' | 'email' | 'phone' | 'summaryNote' | 'active'
  >
>;

export function useUpdateAccountContact() {
  const qc = useQueryClient();
  return useMutation<AccountContact, Error, { id: string; patch: UpdateAccountContactInput }>({
    mutationFn: async ({ id, patch }) =>
      AccountContactSchema.parse(await api.patch<unknown>(`/account-contacts/${id}`, patch)),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: ['account-contacts', 'list', contact.accountId] });
    },
  });
}

export function useDeactivateAccountContact() {
  const qc = useQueryClient();
  return useMutation<AccountContact, Error, string>({
    mutationFn: async (id) =>
      AccountContactSchema.parse(
        await api.post<unknown>(`/account-contacts/${id}/deactivate`),
      ),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: ['account-contacts', 'list', contact.accountId] });
    },
  });
}

/* -------- Account contact notes -------- */

export function useAccountContactNotes(accountContactId: string | undefined) {
  return useQuery<AccountContactNote[]>({
    queryKey: ['account-contact-notes', 'list', accountContactId ?? 'noop'],
    queryFn: async () =>
      accountContactNotesListSchema.parse(
        await api.get<unknown>(`/account-contacts/${accountContactId}/notes`),
      ),
    enabled: Boolean(accountContactId),
  });
}

export function useCreateAccountContactNote(accountContactId: string) {
  const qc = useQueryClient();
  return useMutation<AccountContactNote, Error, { body: string }>({
    mutationFn: async ({ body }) =>
      AccountContactNoteSchema.parse(
        await api.post<unknown>(`/account-contacts/${accountContactId}/notes`, { body }),
      ),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['account-contact-notes', 'list', accountContactId],
      }),
  });
}

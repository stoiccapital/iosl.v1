import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckSquare, Circle, Mail, Phone, Plus, UserRound } from 'lucide-react';
import { SUMMARY_NOTE_MAX, type AccountContact } from '@factory/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatRelative } from '@/lib/format';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { AccountContactDialog } from '@/features/crm/accounts/AccountContactDialog';
import {
  useAccountContacts,
  useAccountNotes,
  useCreateAccountNote,
} from '@/features/crm/accounts/notes-hooks';
import { usePeople } from '@/features/directory/hooks';
import { TaskDialog } from '@/features/tasks/components/TaskDialog';
import { useRelatedTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import type { Task } from '@factory/shared';

export function AccountDetailPage() {
  const { id } = useParams();
  const accountQuery = accountHooks.useItem(id);
  const update = accountHooks.useUpdate(id ?? '');
  const notesQuery = useAccountNotes(id);
  const addNote = useCreateAccountNote(id ?? '');
  const contactsQuery = useAccountContacts(id);
  const people = usePeople('employee');

  const account = accountQuery.data;
  const [summaryNote, setSummaryNote] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (account) setSummaryNote(account.summaryNote);
  }, [account]);

  if (accountQuery.isLoading) {
    return <main className="container py-8 text-muted-foreground">Loading…</main>;
  }
  if (accountQuery.isError || !account) {
    return (
      <main className="container py-8">
        <Link to="/crm/accounts" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Back to Accounts
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">Account not found.</p>
      </main>
    );
  }

  const dirty = summaryNote !== account.summaryNote;
  const summaryEditor = (people.data ?? []).find((p) => p.id === account.summaryNoteUpdatedById);

  const handleSaveSummary = () => {
    if (!dirty) return;
    update.mutate(
      {
        name: account.name,
        industry: account.industry,
        size: account.size,
        country: account.country,
        website: account.website,
        summaryNote,
      },
      {
        onSuccess: () => toast.success('High-level note saved'),
        onError: (err) =>
          toast.error('Could not save note', {
            description: err instanceof Error ? err.message : 'Unknown error',
          }),
      },
    );
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate(
      { body: newNote.trim() },
      {
        onSuccess: () => {
          toast.success('Note added');
          setNewNote('');
        },
        onError: (err) =>
          toast.error('Could not add note', {
            description: err instanceof Error ? err.message : 'Unknown error',
          }),
      },
    );
  };

  const contacts = contactsQuery.data ?? [];

  return (
    <main className="container py-8">
      <Link
        to="/crm/accounts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
        <p className="text-sm text-muted-foreground">
          {account.industry} · {account.size} · {account.country}
          {account.website && (
            <>
              {' · '}
              <a
                href={account.website}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                {account.website.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {/* High-level note */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">High-level note</CardTitle>
            <Button size="sm" onClick={handleSaveSummary} disabled={!dirty || update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            <Textarea
              rows={2}
              maxLength={SUMMARY_NOTE_MAX}
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value.slice(0, SUMMARY_NOTE_MAX))}
              placeholder="Ongoing account context — one or two sentences."
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {account.summaryNoteUpdatedAt && (
                  <>
                    Updated
                    {summaryEditor
                      ? ` by ${summaryEditor.firstName} ${summaryEditor.lastName}`
                      : ''}{' '}
                    <span
                      className="font-mono tabular-nums"
                      title={formatDateTime(account.summaryNoteUpdatedAt)}
                    >
                      {formatRelative(account.summaryNoteUpdatedAt)}
                    </span>
                  </>
                )}
              </span>
              <span className="font-mono tabular-nums">
                {summaryNote.length} / {SUMMARY_NOTE_MAX}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Contacts</CardTitle>
            <AccountContactDialog
              mode="create"
              accountId={account.id}
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add contact
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts yet. Add the people you talk to at this account.
              </p>
            ) : (
              <ul className="divide-y rounded-md border">
                {contacts.map((c) => (
                  <ContactRow key={c.id} contact={c} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Tasks</CardTitle>
            <TaskDialog
              mode="create"
              presetContext={{ relatedType: 'account', relatedId: account.id }}
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add task
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <TasksInline relatedType="account" relatedId={account.id} />
          </CardContent>
        </Card>

        {/* Timestamped notes */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Timestamped notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note (never editable, always timestamped)…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote();
                }}
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim() || addNote.isPending}>
                Add
              </Button>
            </div>
            {notesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading notes…</p>
            ) : (notesQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="divide-y">
                {(notesQuery.data ?? []).map((note) => {
                  const author = (people.data ?? []).find((p) => p.id === note.authorId);
                  return (
                    <li key={note.id} className="py-3 text-sm">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{author ? `${author.firstName} ${author.lastName}` : 'Unknown'}</span>
                        <span
                          className="font-mono tabular-nums"
                          title={formatDateTime(note.createdAt)}
                        >
                          {formatRelative(note.createdAt)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{note.body}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function TasksInline({
  relatedType,
  relatedId,
}: {
  relatedType: 'account' | 'opportunity';
  relatedId: string;
}) {
  const tasks = useRelatedTasks(relatedType, relatedId);
  const items = tasks.data ?? [];
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tasks yet. Add one to keep follow-ups in the loop.
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {items.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </ul>
  );
}

function TaskRow({ task }: { task: Task }) {
  const update = useUpdateTask(task.id);
  const done = task.status === 'done';
  const overdue = task.dueAt && !done && new Date(task.dueAt).getTime() < Date.now();
  return (
    <li className="flex items-start gap-3 py-2 text-sm">
      <button
        type="button"
        onClick={() => update.mutate({ status: done ? 'open' : 'done' })}
        disabled={update.isPending}
        aria-label={done ? 'Mark open' : 'Mark done'}
        className="mt-0.5 text-muted-foreground hover:text-foreground"
      >
        {done ? <CheckSquare className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      </button>
      <TaskDialog
        mode="edit"
        task={task}
        trigger={
          <button type="button" className="flex flex-1 flex-col text-left">
            <span className={done ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
            {task.description && (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {task.description}
              </span>
            )}
          </button>
        }
      />
      {task.dueAt && (
        <span
          className={
            'shrink-0 text-xs font-mono tabular-nums ' +
            (overdue ? 'text-destructive' : 'text-muted-foreground')
          }
          title={task.dueAt}
        >
          {new Date(task.dueAt).toLocaleDateString('de-DE')}
        </span>
      )}
    </li>
  );
}

function ContactRow({ contact }: { contact: AccountContact }) {
  return (
    <li>
      <AccountContactDialog
        mode="edit"
        contact={contact}
        trigger={
          <button
            type="button"
            className="grid w-full grid-cols-[auto_minmax(160px,1.2fr)_minmax(160px,1.2fr)_minmax(120px,1fr)_minmax(200px,2fr)] items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/40"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">
                {contact.firstName} {contact.lastName}
              </div>
              {contact.title && (
                <div className="truncate text-xs text-muted-foreground">{contact.title}</div>
              )}
            </div>
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{contact.email || '—'}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {contact.phone || '—'}
            </span>
            <span
              className="truncate text-xs text-muted-foreground"
              title={contact.summaryNote}
            >
              {contact.summaryNote || '—'}
            </span>
          </button>
        }
      />
    </li>
  );
}

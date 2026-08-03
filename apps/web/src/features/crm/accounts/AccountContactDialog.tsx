import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { SUMMARY_NOTE_MAX, type AccountContact } from '@factory/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatRelative } from '@/lib/format';
import { usePeople } from '@/features/directory/hooks';
import {
  useAccountContactNotes,
  useCreateAccountContact,
  useCreateAccountContactNote,
  useDeactivateAccountContact,
  useUpdateAccountContact,
} from './notes-hooks';

type Mode =
  | { mode: 'create'; accountId: string }
  | { mode: 'edit'; contact: AccountContact };

export function AccountContactDialog(props: Mode & { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        {props.mode === 'create' ? (
          <CreateBody accountId={props.accountId} onDone={() => setOpen(false)} />
        ) : (
          <EditBody contact={props.contact} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateBody({ accountId, onDone }: { accountId: string; onDone: () => void }) {
  const create = useCreateAccountContact(accountId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summaryNote, setSummaryNote] = useState('');

  const canSave = firstName.trim() && lastName.trim() && email.trim() && !create.isPending;

  const handleSave = () => {
    create.mutate(
      { firstName, lastName, title, email, phone, summaryNote },
      {
        onSuccess: () => {
          toast.success('Contact added');
          onDone();
        },
        onError: (err) =>
          toast.error('Could not add contact', {
            description: err instanceof Error ? err.message : 'Unknown error',
          }),
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add contact</DialogTitle>
        <DialogDescription>Add a person to this account.</DialogDescription>
      </DialogHeader>
      <ContactFieldGrid
        firstName={firstName}
        lastName={lastName}
        title={title}
        email={email}
        phone={phone}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setTitle={setTitle}
        setEmail={setEmail}
        setPhone={setPhone}
      />
      <div className="space-y-1">
        <Label>High-level note</Label>
        <Textarea
          rows={2}
          maxLength={SUMMARY_NOTE_MAX}
          value={summaryNote}
          onChange={(e) => setSummaryNote(e.target.value.slice(0, SUMMARY_NOTE_MAX))}
          placeholder="One line — role, style, availability."
        />
        <div className="text-right text-[11px] text-muted-foreground font-mono tabular-nums">
          {summaryNote.length} / {SUMMARY_NOTE_MAX}
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {create.isPending ? 'Saving…' : 'Add contact'}
        </Button>
      </DialogFooter>
    </>
  );
}

function EditBody({ contact, onDone }: { contact: AccountContact; onDone: () => void }) {
  const update = useUpdateAccountContact();
  const deactivate = useDeactivateAccountContact();
  const notesQuery = useAccountContactNotes(contact.id);
  const addNote = useCreateAccountContactNote(contact.id);
  const people = usePeople('employee');

  const [firstName, setFirstName] = useState(contact.firstName);
  const [lastName, setLastName] = useState(contact.lastName);
  const [title, setTitle] = useState(contact.title);
  const [email, setEmail] = useState(contact.email);
  const [phone, setPhone] = useState(contact.phone);
  const [summaryNote, setSummaryNote] = useState(contact.summaryNote);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setFirstName(contact.firstName);
    setLastName(contact.lastName);
    setTitle(contact.title);
    setEmail(contact.email);
    setPhone(contact.phone);
    setSummaryNote(contact.summaryNote);
  }, [contact]);

  const dirty =
    firstName !== contact.firstName ||
    lastName !== contact.lastName ||
    title !== contact.title ||
    email !== contact.email ||
    phone !== contact.phone ||
    summaryNote !== contact.summaryNote;

  const summaryEditor = (people.data ?? []).find((p) => p.id === contact.summaryNoteUpdatedById);

  const handleSave = () => {
    update.mutate(
      {
        id: contact.id,
        patch: { firstName, lastName, title, email, phone, summaryNote },
      },
      {
        onSuccess: () => toast.success('Contact updated'),
        onError: (err) =>
          toast.error('Could not update contact', {
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

  const handleDeactivate = () => {
    deactivate.mutate(contact.id, {
      onSuccess: () => {
        toast.success('Contact removed');
        onDone();
      },
      onError: (err) =>
        toast.error('Could not remove contact', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {contact.firstName} {contact.lastName}
        </DialogTitle>
        <DialogDescription>{contact.title || 'Contact'}</DialogDescription>
      </DialogHeader>

      <ContactFieldGrid
        firstName={firstName}
        lastName={lastName}
        title={title}
        email={email}
        phone={phone}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setTitle={setTitle}
        setEmail={setEmail}
        setPhone={setPhone}
      />

      <div className="space-y-1">
        <Label>High-level note</Label>
        <Textarea
          rows={2}
          maxLength={SUMMARY_NOTE_MAX}
          value={summaryNote}
          onChange={(e) => setSummaryNote(e.target.value.slice(0, SUMMARY_NOTE_MAX))}
          placeholder="One line — role, style, availability."
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {contact.summaryNoteUpdatedAt && (
              <>
                Updated{summaryEditor ? ` by ${summaryEditor.firstName} ${summaryEditor.lastName}` : ''}{' '}
                <span
                  className="font-mono tabular-nums"
                  title={formatDateTime(contact.summaryNoteUpdatedAt)}
                >
                  {formatRelative(contact.summaryNoteUpdatedAt)}
                </span>
              </>
            )}
          </span>
          <span className="font-mono tabular-nums">
            {summaryNote.length} / {SUMMARY_NOTE_MAX}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Timestamped notes</Label>
        <div className="flex gap-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note (never editable)…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote();
            }}
          />
          <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || addNote.isPending}>
            Add
          </Button>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-md border">
          {(notesQuery.data ?? []).length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ul className="divide-y">
              {(notesQuery.data ?? []).map((n) => (
                <li key={n.id} className="p-3 text-sm">
                  <div
                    className="mb-0.5 text-xs text-muted-foreground font-mono tabular-nums"
                    title={formatDateTime(n.createdAt)}
                  >
                    {formatRelative(n.createdAt)}
                  </div>
                  <div className="whitespace-pre-wrap">{n.body}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeactivate}
          disabled={deactivate.isPending}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Remove
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDone} disabled={update.isPending}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={!dirty || update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

function ContactFieldGrid(props: {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setTitle: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
}) {
  const {
    firstName,
    lastName,
    title,
    email,
    phone,
    setFirstName,
    setLastName,
    setTitle,
    setEmail,
    setPhone,
  } = props;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>First name</Label>
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Last name</Label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div className="col-span-2 space-y-1">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            className="pl-8"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="tel"
            className="pl-8"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ban,
  CircleDollarSign,
  Copy,
  Download,
  ExternalLink,
  FileSignature,
  Plus,
} from 'lucide-react';
import {
  PRODUCT_CATALOG,
  canPerform,
  lineMrrCents,
  lineTcvCents,
  type SubscriptionStatus,
} from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  formatCurrencyEUR,
  formatDate,
  formatDateTime,
  formatPercent,
  formatRelative,
} from '@/lib/format';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { useAccountNotes } from '@/features/crm/accounts/notes-hooks';
import { usePeople } from '@/features/directory/hooks';
import { opportunityHooks } from '@/features/crm/opportunities/hooks';
import { OpportunityDialog } from '@/features/crm/opportunities/OpportunityDialog';
import { CloseOpportunityDialog } from '@/features/crm/opportunities/CloseOpportunityDialog';
import { STAGE_LABEL, STAGE_VARIANT } from '@/features/crm/opportunities/stage';
import { subscriptionHooks } from '@/features/billing/hooks';
import { useMarkContractSigned } from '@/features/billing/subscription-actions';
import { TaskDialog } from '@/features/tasks/components/TaskDialog';
import { TasksInline } from '@/pages/crm/AccountDetailPage';

const SUB_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  draft: 'Draft',
  payment_link_sent: 'Payment link sent',
  paid: 'Paid — awaiting activation',
  active: 'Active',
  past_due: 'Past due',
  cancelled: 'Cancelled',
  paused: 'Paused',
};
const SUB_STATUS_VARIANT: Record<
  SubscriptionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'outline',
  payment_link_sent: 'secondary',
  paid: 'secondary',
  active: 'default',
  past_due: 'destructive',
  cancelled: 'outline',
  paused: 'secondary',
};

function productName(code: string): string {
  return PRODUCT_CATALOG.find((p) => p.code === code)?.name ?? code;
}

export function OpportunityDetailPage() {
  const { id } = useParams();
  const oppQuery = opportunityHooks.useItem(id);
  const accounts = accountHooks.useList();
  const people = usePeople('employee');
  const subs = subscriptionHooks.useList();
  const notes = useAccountNotes(oppQuery.data?.accountId);
  const { data: user } = useCurrentUser();
  const markSigned = useMarkContractSigned();
  const update = opportunityHooks.useUpdate(id ?? '');

  const canClose = user ? canPerform(user.role, 'opportunity.close') : false;
  const canSign = user ? canPerform(user.role, 'opportunity.markContractSigned') : false;

  const account = useMemo(
    () => (accounts.data ?? []).find((a) => a.id === oppQuery.data?.accountId),
    [accounts.data, oppQuery.data?.accountId],
  );
  const owner = useMemo(
    () => (people.data ?? []).find((p) => p.id === oppQuery.data?.ownerId),
    [people.data, oppQuery.data?.ownerId],
  );
  const oppSubs = useMemo(
    () => (subs.data ?? []).filter((s) => s.opportunityId === id),
    [subs.data, id],
  );

  if (oppQuery.isLoading) {
    return <main className="container py-8 text-muted-foreground">Loading…</main>;
  }
  if (oppQuery.isError || !oppQuery.data) {
    return (
      <main className="container py-8">
        <Link to="/crm/opportunities" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Back to Opportunities
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">Opportunity not found.</p>
      </main>
    );
  }
  const opp = oppQuery.data;

  const totalMrrCents = opp.lines.reduce(
    (sum, l) => sum + lineMrrCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );

  const canShowClose =
    canClose &&
    opp.stage !== 'proposal' &&
    opp.stage !== 'close_won' &&
    opp.stage !== 'close_lost' &&
    opp.lines.length > 0;
  const canShowSign = canSign && opp.stage === 'proposal' && !opp.contractSigned;
  const canShowLost = opp.stage !== 'close_won' && opp.stage !== 'close_lost';

  const copyLink = () => {
    if (!opp.paymentLinkUrl) return;
    void navigator.clipboard.writeText(opp.paymentLinkUrl);
    toast.success('Payment link copied');
  };

  const handleMarkLost = () =>
    update.mutate(
      { stage: 'close_lost' },
      {
        onSuccess: () => toast.success('Opportunity marked as Close Lost'),
        onError: (err) =>
          toast.error('Could not mark as lost', {
            description: err instanceof Error ? err.message : 'Unknown error',
          }),
      },
    );

  const handleSign = () =>
    markSigned.mutate(opp.id, {
      onSuccess: (o) =>
        toast.success(
          o.stage === 'close_won'
            ? 'Contract signed — opportunity auto-promoted to Close Won'
            : 'Contract marked as signed',
        ),
      onError: (err) =>
        toast.error('Could not mark contract signed', {
          description: err instanceof Error ? err.message : 'Unknown error',
        }),
    });

  return (
    <main className="container py-8">
      <Link
        to="/crm/opportunities"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={STAGE_VARIANT[opp.stage]}>{STAGE_LABEL[opp.stage]}</Badge>
            {opp.stage === 'proposal' && (
              <Badge variant={opp.contractSigned ? 'default' : 'outline'}>
                {opp.contractSigned ? 'Contract signed' : 'Contract unsigned'}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{opp.name}</h1>
          <p className="text-sm text-muted-foreground">
            {account?.name ?? '—'} · Deal size{' '}
            <span className="font-mono tabular-nums">
              {formatCurrencyEUR(opp.amountCents / 100)}
            </span>{' '}
            · MRR{' '}
            <span className="font-mono tabular-nums">
              {formatCurrencyEUR(totalMrrCents / 100)}
            </span>{' '}
            / month
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canShowClose && (
            <CloseOpportunityDialog
              opportunity={opp}
              trigger={
                <Button size="sm" variant="secondary">
                  <CircleDollarSign className="mr-1 h-3.5 w-3.5" />
                  Close & create payment link
                </Button>
              }
            />
          )}
          {canShowSign && (
            <Button
              size="sm"
              variant="secondary"
              disabled={markSigned.isPending}
              onClick={handleSign}
            >
              <FileSignature className="mr-1 h-3.5 w-3.5" />
              Mark contract signed
            </Button>
          )}
          <OpportunityDialog
            mode="edit"
            opportunity={opp}
            trigger={
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            }
          />
          {canShowLost && (
            <Button size="sm" variant="ghost" disabled={update.isPending} onClick={handleMarkLost}>
              <Ban className="mr-1 h-3.5 w-3.5" />
              Lost
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Meta */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Account" value={account?.name ?? '—'} />
            <Field
              label="Owner"
              value={owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'}
            />
            <Field label="Expected close" value={formatDate(opp.expectedCloseDate)} mono />
            <Field label="Probability" value={formatPercent(opp.probability)} mono />
            <Field label="Deal size (TCV)" value={formatCurrencyEUR(opp.amountCents / 100)} mono />
            <Field
              label="MRR"
              value={`${formatCurrencyEUR(totalMrrCents / 100)} / month`}
              mono
            />
            <Field label="Created" value={formatDate(opp.createdAt)} mono />
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Products</CardTitle>
          </CardHeader>
          <CardContent>
            {opp.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products on this opportunity yet.</p>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <div className="grid grid-cols-[minmax(180px,1fr)_80px_100px_100px_100px] gap-2 border-b bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Product</span>
                  <span className="text-right">Licenses</span>
                  <span className="text-right">Duration</span>
                  <span>Cycle</span>
                  <span className="text-right">Deal size</span>
                </div>
                <div className="divide-y">
                  {opp.lines.map((l, i) => (
                    <div
                      key={`${l.productCode}-${i}`}
                      className="grid grid-cols-[minmax(180px,1fr)_80px_100px_100px_100px] items-center gap-2 px-3 py-2 text-sm"
                    >
                      <div className="font-medium">{productName(l.productCode)}</div>
                      <div className="text-right font-mono tabular-nums">{l.quantity}</div>
                      <div className="text-right font-mono tabular-nums">
                        {l.contractMonths} months
                      </div>
                      <div className="capitalize text-muted-foreground">{l.billingCycle}</div>
                      <div className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(
                          lineTcvCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle) / 100,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment link */}
        {opp.paymentLinkUrl && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="break-all rounded-md border bg-muted/40 p-3 font-mono text-xs">
                {opp.paymentLinkUrl}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={copyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={opp.paymentLinkUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={opp.contractSigned ? 'default' : 'outline'}>
                {opp.contractSigned ? 'Signed' : 'Unsigned'}
              </Badge>
            </div>
            {opp.contractSignedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signed</span>
                <span
                  className="font-mono tabular-nums"
                  title={formatDateTime(opp.contractSignedAt)}
                >
                  {formatRelative(opp.contractSignedAt)}
                </span>
              </div>
            )}
            {opp.contractDocumentUrl ? (
              <Button variant="secondary" size="sm" asChild className="w-full">
                <a href={opp.contractDocumentUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download contract
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                No contract attached yet. A PDF is attached automatically when the contract is
                signed.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions */}
        {oppSubs.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <div className="grid grid-cols-[minmax(180px,1fr)_80px_100px_120px_180px] gap-2 border-b bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Product</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">MRR</span>
                  <span>Cycle</span>
                  <span>Status</span>
                </div>
                <div className="divide-y">
                  {oppSubs.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-[minmax(180px,1fr)_80px_100px_120px_180px] items-center gap-2 px-3 py-2 text-sm"
                    >
                      <div className="font-medium">{productName(s.productCode)}</div>
                      <div className="text-right font-mono tabular-nums">{s.quantity}</div>
                      <div className="text-right font-mono tabular-nums">
                        {formatCurrencyEUR(s.mrrCents / 100)}
                      </div>
                      <div className="capitalize text-muted-foreground">{s.billingCycle}</div>
                      <div>
                        <Badge variant={SUB_STATUS_VARIANT[s.status]}>
                          {SUB_STATUS_LABEL[s.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Tasks</CardTitle>
            <TaskDialog
              mode="create"
              presetContext={{ relatedType: 'opportunity', relatedId: opp.id }}
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add task
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <TasksInline relatedType="opportunity" relatedId={opp.id} />
          </CardContent>
        </Card>

        {/* Account notes (read-only) */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">
              Notes on {account?.name ?? 'account'}
            </CardTitle>
            {account && (
              <Link
                to={`/crm/accounts/${account.id}`}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Open account →
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {account?.summaryNote && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  High-level note
                </div>
                <div className="whitespace-pre-wrap">{account.summaryNote}</div>
              </div>
            )}
            {notes.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading notes…</p>
            ) : (notes.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timestamped notes on this account yet. Add them on the account page.
              </p>
            ) : (
              <ul className="divide-y">
                {(notes.data ?? []).map((note) => {
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

      <Separator className="mt-8" />
      <p className="mt-4 text-xs text-muted-foreground">
        Opportunity ID: <span className="font-mono">{opp.id}</span>
      </p>
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono tabular-nums' : ''}>{value}</span>
    </div>
  );
}

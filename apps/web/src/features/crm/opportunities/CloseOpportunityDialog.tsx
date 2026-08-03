import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Check, Copy, ExternalLink, Mail } from 'lucide-react';
import {
  PRODUCT_CATALOG,
  lineMrrCents,
  lineTcvCents,
  type Opportunity,
} from '@factory/shared';
import { accountHooks } from '@/features/crm/accounts/hooks';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { formatCurrencyEUR } from '@/lib/format';
import { useCloseOpportunity } from '@/features/billing/subscription-actions';

function productName(code: string): string {
  return PRODUCT_CATALOG.find((p) => p.code === code)?.name ?? code;
}

export function CloseOpportunityDialog({
  opportunity,
  trigger,
}: {
  opportunity: Opportunity;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const close = useCloseOpportunity(opportunity.id);
  const accounts = accountHooks.useList();
  const accountName =
    (accounts.data ?? []).find((a) => a.id === opportunity.accountId)?.name ?? '';

  const hasLines = opportunity.lines.length > 0;
  const totalCents = opportunity.lines.reduce(
    (sum, l) => sum + lineTcvCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );
  const totalMrrCents = opportunity.lines.reduce(
    (sum, l) => sum + lineMrrCents(l.productCode, l.quantity, l.contractMonths, l.billingCycle),
    0,
  );

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setLinkUrl(null);
      close.reset();
    }, 300);
  };

  const handleSubmit = () => {
    close.mutate(
      {},
      {
        onSuccess: (result) => {
          setLinkUrl(result.paymentLinkUrl);
          toast.success('Payment link created — send it to the customer.');
        },
        onError: (err) =>
          toast.error('Could not close opportunity', {
            description: err instanceof Error ? err.message : 'Unknown error',
          }),
      },
    );
  };

  const copyLink = () => {
    if (!linkUrl) return;
    void navigator.clipboard.writeText(linkUrl);
    toast.success('Payment link copied');
  };

  const emailLink = () => {
    if (!linkUrl) return;
    const subject = encodeURIComponent(`Payment link — ${opportunity.name}`);
    const body = encodeURIComponent(`Hi,\n\nHere's your payment link:\n${linkUrl}\n\nThanks.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        {linkUrl ? (
          <SuccessView
            linkUrl={linkUrl}
            onCopy={copyLink}
            onEmail={emailLink}
            onDone={handleClose}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Close &amp; create subscription</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">{opportunity.name}</span>
                {accountName && (
                  <>
                    {' · '}
                    <span>{accountName}</span>
                  </>
                )}
                <br />
                Confirms the products already on this opportunity, moves it to Close&nbsp;Won and
                generates a Stripe payment link.
              </DialogDescription>
            </DialogHeader>

            {hasLines ? (
              <div className="overflow-hidden rounded-md border">
                <div className="grid grid-cols-[minmax(200px,1fr)_72px_112px_100px_112px] gap-2 border-b bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Product</span>
                  <span className="text-right">Licenses</span>
                  <span className="text-right">Duration</span>
                  <span>Cycle</span>
                  <span className="text-right">Deal size</span>
                </div>
                <div className="divide-y">
                  {opportunity.lines.map((line, i) => {
                    const lineTotal = lineTcvCents(
                      line.productCode,
                      line.quantity,
                      line.contractMonths,
                      line.billingCycle,
                    );
                    return (
                      <div
                        key={`${line.productCode}-${i}`}
                        className="grid grid-cols-[minmax(200px,1fr)_72px_112px_100px_112px] items-center gap-2 px-3 py-2 text-sm"
                      >
                        <div className="font-medium">{productName(line.productCode)}</div>
                        <div className="text-right font-mono tabular-nums">
                          {line.quantity}
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          {line.contractMonths} months
                        </div>
                        <div className="capitalize text-muted-foreground">{line.billingCycle}</div>
                        <div className="text-right font-mono tabular-nums">
                          {formatCurrencyEUR(lineTotal / 100)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                This opportunity has no products yet. Edit it and add at least one product before
                closing.
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between px-1 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Total deal size</span>
                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {formatCurrencyEUR(totalMrrCents / 100)} / month
                </span>
              </div>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {formatCurrencyEUR(totalCents / 100)}
              </span>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose} disabled={close.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!hasLines || close.isPending}>
                {close.isPending ? 'Creating…' : 'Close & create payment link'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessView({
  linkUrl,
  onCopy,
  onEmail,
  onDone,
}: {
  linkUrl: string;
  onCopy: () => void;
  onEmail: () => void;
  onDone: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-4 w-4" />
          </div>
          <Badge variant="secondary">Proposal</Badge>
        </div>
        <DialogTitle>Payment link ready</DialogTitle>
        <DialogDescription>
          Opportunity moved to <span className="font-medium">Proposal</span>. Send this link to the
          customer. Once they&apos;ve paid <em>and</em> the contract is signed, the opportunity
          auto-promotes to <span className="font-medium">Close Won</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-md border bg-muted/40 p-3">
        <div className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
          Stripe payment link
        </div>
        <div className="break-all font-mono text-sm">{linkUrl}</div>
      </div>

      <DialogFooter className="sm:justify-between">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={onEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send by email
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={linkUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </a>
          </Button>
        </div>
        <Button onClick={onDone}>Done</Button>
      </DialogFooter>
    </>
  );
}

import type { CampaignChannel, CampaignStatus } from '@factory/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/data/DataTableShell';
import { formatCurrencyEUR, formatDate, formatNumber } from '@/lib/format';
import { campaignHooks } from '@/features/marketing/hooks';

const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  email: 'Email',
  social: 'Social',
  paid_search: 'Paid search',
  content: 'Content',
  event: 'Event',
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  planned: 'Planned',
  live: 'Live',
  complete: 'Complete',
  cancelled: 'Cancelled',
};
const STATUS_VARIANT: Record<CampaignStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  planned: 'outline',
  live: 'default',
  complete: 'secondary',
  cancelled: 'destructive',
};

export function CampaignsPage() {
  const query = campaignHooks.useList();
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground text-sm">Marketing programs across channels.</p>
      </header>
      <DataTableShell {...query} emptyMessage="No campaigns yet.">
        {(rows) => (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Start</TableHead>
                  <TableHead className="text-right">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{CHANNEL_LABEL[c.channel]}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCurrencyEUR(c.budgetCents / 100)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCurrencyEUR(c.spentCents / 100)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatNumber(c.leadsGenerated)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatDate(c.startDate)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {c.endDate ? formatDate(c.endDate) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTableShell>
    </main>
  );
}

import type { WebsiteSubmission } from '@factory/shared';
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
import { formatDateTime } from '@/lib/format';
import { useWebsiteSubmissions } from '@/features/marketing/websites/hooks';

type Props = { websiteId: string };

const KIND_LABEL: Record<WebsiteSubmission['kind'], string> = {
  ride_interest: 'Ride interest',
  driver_application: 'Driver application',
};

const KIND_VARIANT: Record<
  WebsiteSubmission['kind'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  ride_interest: 'default',
  driver_application: 'secondary',
};

function payloadSummary(s: WebsiteSubmission): string {
  const p = s.payload as Record<string, string | undefined>;
  const parts = [p['name'], p['email'], p['phone'], p['city'], p['licenseClass']].filter(Boolean);
  return parts.join(' · ');
}

export function SubmissionsTable({ websiteId }: Props) {
  const query = useWebsiteSubmissions(websiteId);
  return (
    <DataTableShell {...query} emptyMessage="No submissions yet.">
      {(rows) => (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kind</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Routed to</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge variant={KIND_VARIANT[s.kind]}>{KIND_LABEL[s.kind]}</Badge>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-xs uppercase">
                    {s.locale}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm">{payloadSummary(s)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.leadId ? 'CRM lead' : s.candidateId ? 'Recruiting candidate' : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatDateTime(s.submittedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DataTableShell>
  );
}

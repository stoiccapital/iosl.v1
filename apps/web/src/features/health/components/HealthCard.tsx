import type { HealthStatus } from '@factory/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatDuration } from '@/lib/format';
import { useHealth } from '../hooks/use-health';

const STATUS_VARIANT: Record<HealthStatus['status'], 'default' | 'secondary' | 'destructive'> = {
  ok: 'default',
  degraded: 'secondary',
  down: 'destructive',
};

export function HealthCard() {
  const { data, isLoading, isError, error } = useHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Live status of the IOSL backend.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-40" />
          </>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Health check failed</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="text-right">
              <Badge variant={STATUS_VARIANT[data.status]}>{data.status.toUpperCase()}</Badge>
            </dd>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="text-right font-mono">{data.version}</dd>
            <dt className="text-muted-foreground">Uptime</dt>
            <dd className="text-right font-mono tabular-nums">
              {formatDuration(data.uptimeSeconds)}
            </dd>
            <dt className="text-muted-foreground">Checked at</dt>
            <dd className="text-right font-mono tabular-nums">{formatDateTime(data.checkedAt)}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

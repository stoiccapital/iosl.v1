import { useState } from 'react';
import {
  NotificationChannelSchema,
  NotificationTopicSchema,
  type NotificationChannel,
  type NotificationTopic,
} from '@factory/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TOPIC_LABEL: Record<NotificationTopic, string> = {
  ticket_assigned: 'Ticket assigned to me',
  invoice_due: 'Invoice due',
  invoice_paid: 'Invoice paid',
  opportunity_stage_change: 'Opportunity stage change',
  candidate_stage_change: 'Candidate stage change',
  incident_opened: 'Incident opened',
  mention: '@ mention',
};

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  email: 'Email',
  in_app: 'In-app',
  slack: 'Slack',
};

type Prefs = Record<NotificationTopic, Record<NotificationChannel, boolean>>;

function defaultPrefs(): Prefs {
  const p = {} as Prefs;
  for (const topic of NotificationTopicSchema.options) {
    p[topic] = { email: true, in_app: true, slack: false };
  }
  return p;
}

export function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(() => defaultPrefs());

  const toggle = (topic: NotificationTopic, channel: NotificationChannel) => {
    setPrefs((prev) => ({
      ...prev,
      [topic]: { ...prev[topic], [channel]: !prev[topic][channel] },
    }));
  };

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Choose how you want to be notified about each event. Preferences are local for now.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Per-topic delivery</CardTitle>
          <CardDescription>Tick the channels you want to receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  {NotificationChannelSchema.options.map((c) => (
                    <TableHead key={c} className="text-center">
                      {CHANNEL_LABEL[c]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {NotificationTopicSchema.options.map((topic) => (
                  <TableRow key={topic}>
                    <TableCell className="font-medium">{TOPIC_LABEL[topic]}</TableCell>
                    {NotificationChannelSchema.options.map((channel) => (
                      <TableCell key={channel} className="text-center">
                        <Label className="inline-flex cursor-pointer items-center">
                          <Checkbox
                            checked={prefs[topic][channel]}
                            onCheckedChange={() => toggle(topic, channel)}
                          />
                        </Label>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

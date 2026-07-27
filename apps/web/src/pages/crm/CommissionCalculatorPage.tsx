import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EurInput } from '@/components/data/EurInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyEUR, formatPercent } from '@/lib/format';
import { CHART_MUTED, CHART_PRIMARY } from '@/features/bi/chart-theme';
import { compute, curve, type CommissionPlan } from '@/features/compensation/calculator/formulas';

const STORAGE_KEY = 'iosl:comm-calc';

type Persisted = CommissionPlan & { bookingsCents: number };

const DEFAULTS: Persisted = {
  oteCents: 150_000_00,
  variableSplitPct: 40,
  quotaCents: 1_000_000_00,
  hurdlePct: 100,
  acceleratorMultiplier: 1.5,
  bookingsCents: 600_000_00,
};

function loadInitial(): Persisted {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function CommissionCalculatorPage() {
  const [state, setState] = useState<Persisted>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const plan: CommissionPlan = state;
  const result = useMemo(() => compute(plan, state.bookingsCents), [plan, state.bookingsCents]);
  const curveData = useMemo(() => curve(plan), [plan]);

  const setField = <K extends keyof Persisted>(key: K, value: Persisted[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const attainmentPctInt = Math.round(result.attainmentPct);

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Commission calculator</h1>
        <p className="text-muted-foreground text-sm">
          Model your plan. Every number is computed live — nothing here is saved to the backend.
          Inputs persist in this browser only.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ---------- Inputs ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Your compensation structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>OTE (per period)</Label>
              <EurInput
                valueCents={state.oteCents}
                onChangeCents={(v) => setField('oteCents', v)}
              />
              <p className="text-muted-foreground text-xs">On-Target Earnings.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Variable split (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                className="font-mono tabular-nums"
                value={state.variableSplitPct}
                onChange={(e) =>
                  setField(
                    'variableSplitPct',
                    Math.max(0, Math.min(100, Number.parseFloat(e.target.value || '0'))),
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                {100 - state.variableSplitPct} % base · {state.variableSplitPct} % variable.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Quota (per period)</Label>
              <EurInput
                valueCents={state.quotaCents}
                onChangeCents={(v) => setField('quotaCents', v)}
              />
              <p className="text-muted-foreground text-xs">Bookings target at 100 %.</p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Hurdle (%)</Label>
              <Input
                type="number"
                min={0}
                max={500}
                className="font-mono tabular-nums"
                value={state.hurdlePct}
                onChange={(e) =>
                  setField('hurdlePct', Math.max(0, Number.parseFloat(e.target.value || '0')))
                }
              />
              <p className="text-muted-foreground text-xs">
                Attainment at which acceleration kicks in.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Accelerator (×)</Label>
              <Input
                type="number"
                min={1}
                step="0.05"
                className="font-mono tabular-nums"
                value={state.acceleratorMultiplier}
                onChange={(e) =>
                  setField(
                    'acceleratorMultiplier',
                    Math.max(1, Number.parseFloat(e.target.value || '1')),
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                Multiplier applied to the base rate above the hurdle. 1.5 = 150 %.
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Bookings so far</Label>
              <EurInput
                valueCents={state.bookingsCents}
                onChangeCents={(v) => setField('bookingsCents', v)}
              />
              <p className="text-muted-foreground text-xs font-mono tabular-nums">
                Attainment: {formatPercent(result.attainmentPct, 1)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Outputs ---------- */}
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Base salary</CardTitle>
                <CardDescription>{100 - state.variableSplitPct} % of OTE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatCurrencyEUR(result.baseSalaryCents / 100)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variable @ target</CardTitle>
                <CardDescription>{state.variableSplitPct} % of OTE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatCurrencyEUR(result.variableAtTargetCents / 100)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Commission earned</CardTitle>
                <CardDescription>At current bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl tabular-nums">
                  {formatCurrencyEUR(result.commissionEarnedCents / 100)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Base rate</CardTitle>
                <CardDescription>Below the hurdle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xl tabular-nums">
                  {formatPercent(result.baseRatePctBps / 100, 2)}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  Variable / Quota
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accelerated rate</CardTitle>
                <CardDescription>Above the hurdle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xl tabular-nums">
                  {formatPercent(result.acceleratedRatePctBps / 100, 2)}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  Base × {state.acceleratorMultiplier.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total earnings</CardTitle>
                <CardDescription>Base + earned commission</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xl tabular-nums">
                  {formatCurrencyEUR(result.totalIfAtCurrentAttainmentCents / 100)}
                </div>
                <p className="text-muted-foreground text-xs font-mono tabular-nums">
                  vs OTE {formatCurrencyEUR(result.totalOnTargetEarningsCents / 100)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commission by attainment</CardTitle>
              <CardDescription>
                Line steepens past the {state.hurdlePct} % hurdle.
              </CardDescription>
            </CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={curveData.map((p) => ({
                    attainment: p.attainmentPct,
                    commission: p.commissionCents / 100,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="attainment"
                    fontSize={12}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    fontSize={12}
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat('de-DE', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                  />
                  <Tooltip
                    formatter={(v: unknown) => formatCurrencyEUR(Number(v))}
                    labelFormatter={(v: unknown) => `${Number(v).toFixed(0)} % attainment`}
                  />
                  <Legend />
                  <ReferenceLine
                    x={state.hurdlePct}
                    stroke={CHART_MUTED}
                    strokeDasharray="4 3"
                    label={{ value: 'Hurdle', position: 'top', fontSize: 11 }}
                  />
                  <ReferenceDot
                    x={attainmentPctInt}
                    y={result.commissionEarnedCents / 100}
                    r={5}
                    fill={CHART_PRIMARY}
                    stroke="white"
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    name="Commission"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

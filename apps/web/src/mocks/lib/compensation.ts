import type {
  CompensationEvent,
  CompensationRule,
  Opportunity,
} from '@factory/shared';
import { db } from '../db';

/**
 * Compute a compensation event amount from a rule + a source amount (e.g.
 * an opportunity's amount). Handles percentage or fixed, with optional cap.
 */
export function computeAmountCents(rule: CompensationRule, sourceAmountCents: number): number {
  let amount = 0;
  if (rule.computation === 'percentage_of_source' && rule.percentageBps != null) {
    amount = Math.round((sourceAmountCents * rule.percentageBps) / 10_000);
  } else if (rule.computation === 'fixed_amount' && rule.fixedAmountCents != null) {
    amount = rule.fixedAmountCents;
  }
  if (rule.capCents != null && amount > rule.capCents) {
    amount = rule.capCents;
  }
  return amount;
}

function activeRulesFor(personId: string, triggerType: CompensationRule['triggerType']): CompensationRule[] {
  const now = Date.now();
  return db.compensationRules.filter((r) => {
    if (!r.active) return false;
    if (r.personId !== personId) return false;
    if (r.triggerType !== triggerType) return false;
    const from = new Date(r.effectiveFrom).getTime();
    const to = r.effectiveTo ? new Date(r.effectiveTo).getTime() : Number.POSITIVE_INFINITY;
    return from <= now && now <= to;
  });
}

/**
 * Idempotent: never creates duplicate events for the same (rule, source).
 * Called from the Opportunity PATCH handler when stage transitions to
 * `close_won`, and also from seed to backfill historical wins.
 */
export function generateCommissionEventsForOpportunity(opp: Opportunity): CompensationEvent[] {
  if (opp.stage !== 'close_won' || !opp.ownerId) return [];
  const rules = activeRulesFor(opp.ownerId, 'opportunity_won');
  const created: CompensationEvent[] = [];
  const now = new Date().toISOString();
  for (const rule of rules) {
    const already = db.compensationEvents.find(
      (e) => e.ruleId === rule.id && e.sourceType === 'opportunity' && e.sourceId === opp.id,
    );
    if (already) continue;
    const amount = computeAmountCents(rule, opp.amountCents);
    if (amount <= 0) continue;
    const event: CompensationEvent = {
      id: crypto.randomUUID(),
      personId: rule.personId,
      ruleId: rule.id,
      kind: rule.kind,
      triggerType: 'opportunity_won',
      sourceType: 'opportunity',
      sourceId: opp.id,
      amountCents: amount,
      earnedAt: opp.expectedCloseDate,
      status: 'earned',
      approvedById: null,
      approvedAt: null,
      paidAt: null,
      note: `Auto: ${opp.name}`,
      createdAt: now,
      updatedAt: now,
    };
    db.compensationEvents.unshift(event);
    created.push(event);
  }
  return created;
}

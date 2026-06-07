'use client';

import { useState } from 'react';
import { MemberSearch } from '@src/features/payments/components/member-search';
import { ChangePlanDialog } from '@src/features/subscriptions/components/change-plan-dialog';
import { useChangePlan } from '@src/features/subscriptions/hooks/useChangePlan';
import { usePlans } from '@src/features/subscriptions/hooks/usePlans';
import { useUserSubscription } from '@src/features/subscriptions/hooks/useUserSubscription';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent } from '@src/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { formattedAmount } from '@src/shared/utils/format';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CreditCard,
  Loader2,
  Tag,
  User,
  XCircle,
} from 'lucide-react';

interface SelectedMember {
  id: string;
  name: string;
  email: string;
}

export function ChangePlanPage() {
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { subscription, isLoading: subscriptionLoading } = useUserSubscription(
    selectedMember?.id ?? '',
  );
  const { plans } = usePlans();
  const changePlanMutation = useChangePlan();

  const currentPlanId = subscription?.planId ?? '';
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const hasSubscription = !!subscription;
  const canSubmit = selectedPlanId && selectedPlanId !== currentPlanId && selectedMember;

  const handleConfirm = () => {
    if (!selectedMember || !selectedPlanId) return;
    changePlanMutation.mutate(
      { planId: selectedPlanId, userId: selectedMember.id },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedPlanId('');
        },
        onError: () => {
          setConfirmOpen(false);
        },
      },
    );
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedPlanId('');
  };

  return (
    <>
      <SectionHeader
        title="Change Subscription Plan"
        description="Search for a member to view and change their subscription plan"
      />

      <Card className="border-hairline bg-surface-card">
        <CardContent className="pt-6">
          {!selectedMember ? (
            <>
              <p className="text-sm font-medium text-ink mb-3">Select Member</p>
              <MemberSearch onSelect={(member) => setSelectedMember(member as SelectedMember)} />
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary/10 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{selectedMember.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearMember}>
                Change Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <>
          {subscriptionLoading ? (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="ml-3 text-body">Loading subscription...</p>
              </CardContent>
            </Card>
          ) : hasSubscription ? (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Plan
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {subscription?.plan?.name ?? '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {subscription?.planVersion
                        ? formattedAmount(
                            subscription.planVersion.amount,
                            subscription.planVersion.currency,
                          )
                        : '-'}
                      <span className="text-xs text-muted-foreground ml-1">
                        /{subscription?.planVersion?.billingCycle?.toLowerCase() ?? ''}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1 mt-1">
                      {subscription?.status === 'ACTIVE' ? (
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-ink">{subscription?.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Period</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-ink">
                        {subscription?.startDate
                          ? new Date(subscription.startDate).toLocaleDateString()
                          : '-'}
                        {' — '}
                        {subscription?.endDate
                          ? new Date(subscription.endDate).toLocaleDateString()
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-ink">No Active Subscription</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This member does not have an active subscription. Select a plan below to subscribe
                  them.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  New Plan
                </h2>
              </div>

              <div className="flex justify-end items-center">
                <div className="max-w-sm">
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} — {formattedAmount(plan.activeVersion?.amount ?? 0)}/
                          {plan.activeVersion?.billingCycle?.toLowerCase() ?? ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedPlanId === currentPlanId && (
                <p className="text-xs text-amber-600 mt-2">
                  This is the member&apos;s current plan. Select a different plan to change.
                </p>
              )}

              {selectedPlan && selectedPlanId !== currentPlanId && (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 rounded-none border border-hairline bg-surface-card p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium text-ink mt-1">{selectedPlan.name}</p>
                    {selectedPlan.description && (
                      <p className="text-xs text-body mt-1">{selectedPlan.description}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {formattedAmount(
                        selectedPlan.activeVersion?.amount ?? 0,
                        selectedPlan.activeVersion?.currency,
                      )}
                      <span className="text-xs text-muted-foreground ml-1">
                        /{selectedPlan.activeVersion?.billingCycle?.toLowerCase() ?? ''}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Member Type</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {selectedPlan.memberTypeId ? (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          Level {selectedPlan.memberType.level}
                        </span>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 w-full flex flex-row justify-end items-center">
                <Button onClick={() => setConfirmOpen(true)} disabled={!canSubmit}>
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <ChangePlanDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleConfirm}
            isPending={changePlanMutation.isPending}
            currentPlan={subscription}
            newPlan={selectedPlan}
          />
        </>
      )}
    </>
  );
}

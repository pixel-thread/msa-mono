'use client';

import { useState } from 'react';
import { usePlans } from '@src/features/plans/hooks/use-plans';
import { DataTable } from '@src/shared/components/data-table';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import { Input } from '@src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { usePlanVersions } from '@src/shared/hooks';
import { formattedAmount } from '@src/shared/utils';

import { useRetroactiveAffectedUsers } from '../hooks/use-retroactive-affected-users';
import { useRetroactiveAffectedUsersColumns } from '../hooks/use-retroactive-affected-users-columns';

type SearchMode = 'planVersion' | 'dateRange';

export default function RetroactivePage() {
  const [searchMode, setSearchMode] = useState<SearchMode>('planVersion');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { plans } = usePlans();
  const { planVersions } = usePlanVersions(selectedPlanId);
  const { records, isPending, search } = useRetroactiveAffectedUsers();
  const { columns } = useRetroactiveAffectedUsersColumns();

  const handleSearch = () => {
    if (searchMode === 'planVersion' && selectedVersionId) {
      search({ planVersionId: selectedVersionId });
    } else if (searchMode === 'dateRange' && startDate && endDate) {
      search({ startDate, endDate });
    }
  };

  const handleReset = () => {
    setSelectedPlanId('');
    setSelectedVersionId('');
    setStartDate('');
    setEndDate('');
    search({});
  };

  const handleModeSwitch = (mode: SearchMode) => {
    setSearchMode(mode);
    setSelectedPlanId('');
    setSelectedVersionId('');
    setStartDate('');
    setEndDate('');
  };

  const hasSearched = records.length > 0;

  return (
    <>
      <SectionHeader
        title="Retroactive Affected Users"
        description="View users affected by retroactive adjustments"
      />

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={searchMode === 'planVersion' ? 'default' : 'outline'}
            onClick={() => handleModeSwitch('planVersion')}
            className="h-10"
          >
            By Plan Version
          </Button>
          <Button
            variant={searchMode === 'dateRange' ? 'default' : 'outline'}
            onClick={() => handleModeSwitch('dateRange')}
            className="h-10"
          >
            By Date Range
          </Button>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          {searchMode === 'planVersion' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Plan</label>
                <Select
                  value={selectedPlanId}
                  onValueChange={(v) => {
                    setSelectedPlanId(v);
                    setSelectedVersionId('');
                  }}
                >
                  <SelectTrigger className="w-[240px] h-10">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Version</label>
                <Select
                  value={selectedVersionId}
                  onValueChange={setSelectedVersionId}
                  disabled={!selectedPlanId}
                >
                  <SelectTrigger className="w-[240px] h-10">
                    <SelectValue
                      placeholder={selectedPlanId ? 'Select a version' : 'Select a plan first'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {planVersions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.effectiveFrom} — {v.effectiveTo ?? 'Present'} (
                        {formattedAmount(v.amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-[200px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-[200px]"
                />
              </div>
            </>
          )}

          <Button
            onClick={handleSearch}
            className="h-10"
            disabled={searchMode === 'planVersion' ? !selectedVersionId : !(startDate && endDate)}
          >
            Search
          </Button>
          {hasSearched && (
            <Button variant="outline" onClick={handleReset} className="h-10">
              Reset
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6">
        {hasSearched ? (
          <DataTable columns={columns} data={records} loading={isPending} />
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Select a plan version or date range and click Search to view affected users.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { DataTable } from '@components/data-table';
import { DataTableFilters } from '@components/data-table-filters';
import { DataTablePagination } from '@components/data-table-pagination';
import { SectionHeader } from '@components/section-header';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { useLedgerAccounts } from '@hooks/useLedgerAccounts';
import { useUrlFilters } from '@src/shared/hooks';
import type { Account } from '@src/shared/types';
import { BanknoteIcon, Plus, Sprout } from 'lucide-react';

import { CreateAccountDialog } from '../components/create-account-dialog';
import { UpdateAccountDialog } from '../components/update-account-dialog';
import { useLedgerAccountColumns } from '../hooks/columns/useLedgerAccountColumns';
import { useSeedAccounts } from '../hooks/useSeedAccounts';

export default function LedgerAccountsPage() {
  const { page, setPage } = useUrlFilters({ basePath: '/ledger/accounts' });
  const { accounts, isLoading, meta } = useLedgerAccounts({ page });
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState<Account | null>(null);

  const handleEdit = (account: Account) => {
    setAccountToUpdate(account);
    setUpdateOpen(true);
  };

  const { columns } = useLedgerAccountColumns(handleEdit);
  const { mutate: seedAccounts, isPending: isSeeding } = useSeedAccounts();

  return (
    <>
      <SectionHeader
        title="Chart of Accounts"
        description="Manage the Chart of Accounts for your association"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => seedAccounts()}
            disabled={isSeeding || accounts.length > 0}
          >
            <Sprout
              className="h-
            4 w-4 mr-2"
            />
            Seed Accounts
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
        </div>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className=" border-hairline bg-surface-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className=" bg-green-50 p-2.5">
                <BanknoteIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Accounts
                </p>
                <p className="mt-0.5 text-2xl font-semibold text-ink">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search accounts...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={accounts} columns={columns} />
      <DataTablePagination meta={meta} onPageChange={setPage} />

      <CreateAccountDialog open={createOpen} onOpenChange={setCreateOpen} />
      <UpdateAccountDialog
        account={accountToUpdate}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
    </>
  );
}

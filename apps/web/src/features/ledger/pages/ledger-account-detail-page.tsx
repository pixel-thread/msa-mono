'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLedgerAccount } from '../hooks/useLedgerAccount';
import { useLedgerEntries } from '../hooks/useLedgerEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { SectionHeader } from '@src/shared/components/section-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/shared/components/ui/table';
import { Loading } from '@src/shared/components/loading';
import { formatCurrency } from '@src/shared/utils/format';
import { DataTable } from '@src/shared/components/data-table';
import { useLedgerEntriesColumns } from '../hooks/useLedgerEntriesColumns';

export default function LedgerAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  const { account, isLoading: accountLoading } = useLedgerAccount(accountId);
  const { entries, isLoading: entriesLoading } = useLedgerEntries();
  const { columns: entryColumns } = useLedgerEntriesColumns();

  // Filter entries that have at least one line for this account
  const accountEntries = entries.filter((entry) =>
    entry.lines.some((line) => line.accountId === accountId),
  );

  if (accountLoading || entriesLoading) {
    return <Loading />;
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Account not found</p>
      </div>
    );
  }

  const { report } = account;
  const trialBalance = report.trailBalance.balances[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${account.code} - ${account.name}`}
        description={account.description || `Account details and report for ${account.name}`}
        onBackClick={() => router.push('/ledger/accounts')}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className=" border-hairline bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
            <p className="mt-1 text-lg font-semibold text-ink">{account.type}</p>
          </CardContent>
        </Card>
        <Card className=" border-hairline bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Debits
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatCurrency(Number(trialBalance.debitTotal))}
            </p>
          </CardContent>
        </Card>
        <Card className=" border-hairline bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Credits
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatCurrency(Number(trialBalance.creditTotal))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className=" border-hairline bg-surface-card">
          <CardHeader>
            <CardTitle>Trial Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Debit Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(trialBalance.debitTotal))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Credit Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(trialBalance.creditTotal))}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Net Balance</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(trialBalance.balance))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className=" border-hairline bg-surface-card">
          <CardHeader>
            <CardTitle>Income Statement Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {report.incomeStatement.details.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Income</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(report.incomeStatement.totalIncome))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Expense</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(report.incomeStatement.totalExpense))}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Net Impact</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(report.incomeStatement.netIncome))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                This account does not affect the Income Statement.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className=" border-hairline bg-surface-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={entryColumns} data={accountEntries} />
        </CardContent>
      </Card>
    </div>
  );
}

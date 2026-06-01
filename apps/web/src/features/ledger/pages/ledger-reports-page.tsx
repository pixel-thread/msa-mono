'use client';

import { useTrialBalance } from '../hooks/useTrialBalance';
import { useIncomeStatement } from '../hooks/useIncomeStatement';
import { SectionHeader } from '@components/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function LedgerReportsPage() {
  const { data: trialData, isLoading: trialLoading } = useTrialBalance();
  const { data: incomeData, isLoading: incomeLoading } = useIncomeStatement();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Financial Reports"
        description="Trial Balance and Income Statement views."
      />

      <Tabs defaultValue="trial-balance">
        <TabsList>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {trialLoading ? (
                <div>Loading...</div>
              ) : (
                trialData && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialData.lines.map((line) => (
                        <TableRow key={line.accountId}>
                          <TableCell>
                            {line.accountCode} - {line.accountName}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold border-t-2">
                        <TableCell>Totals</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(trialData.totalDebits)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(trialData.totalCredits)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Statement</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeLoading ? (
                <div>Loading...</div>
              ) : (
                incomeData && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Income</h3>
                      <Table>
                        <TableBody>
                          {incomeData.income.map((line) => (
                            <TableRow key={line.accountId}>
                              <TableCell>
                                {line.accountCode} - {line.accountName}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(line.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold">
                            <TableCell>Total Income</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(incomeData.totalIncome)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Expenses</h3>
                      <Table>
                        <TableBody>
                          {incomeData.expenses.map((line) => (
                            <TableRow key={line.accountId}>
                              <TableCell>
                                {line.accountCode} - {line.accountName}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(line.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold">
                            <TableCell>Total Expenses</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(incomeData.totalExpenses)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg font-bold text-lg">
                      <span>Net Income</span>
                      <span
                        className={incomeData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}
                      >
                        {formatCurrency(incomeData.netIncome)}
                      </span>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

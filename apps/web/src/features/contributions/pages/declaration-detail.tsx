'use client';

import { useParams, useNavigate } from '@tanstack/react-router';
import { useDeclarationDetail } from '../hooks/declarations/use-declaration-detail';
import { SectionHeader } from '@src/shared/components/section-header';
import { Card, CardHeader, CardTitle, CardContent } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Separator } from '@src/shared/components/ui/separator';
import { formatDate } from '@src/shared/utils';
import { User, Calendar, IndianRupee, ClipboardList } from 'lucide-react';

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

export function DeclarationDetailPage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const declarationId = params.declarationId as string;

  const { declaration, isLoading } = useDeclarationDetail(declarationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading declaration details...</p>
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">Declaration not found</p>
        <Button
          variant="outline"
          className="mt-4 h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => window.history.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title="Declaration Details"
        description={`ID: ${declaration.id.slice(0, 8)}...`}
        onBackClick={() => window.history.back()}
      >
        <Badge variant={statusBadgeVariant[declaration.status] ?? 'outline'}>
          {declaration.status}
        </Badge>
      </SectionHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-hairline bg-surface-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Declaration Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium text-ink mt-1 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {declaration.amount}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm text-ink mt-1">
                    <Badge variant={statusBadgeVariant[declaration.status] ?? 'outline'}>
                      {declaration.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <Separator className="bg-hairline" />

              <div>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <Calendar className="h-3 w-3" />
                  Declaration Period
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.declerationStartDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.declerationEndDate)}
                    </p>
                  </div>
                </div>
              </div>

              {declaration.lastDeclarationDate && (
                <>
                  <Separator className="bg-hairline" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Last Declaration Date
                    </p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.lastDeclarationDate)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">{declaration.member.name}</p>
                <p className="text-sm text-muted-foreground">{declaration.member.email}</p>
                <p className="text-sm text-muted-foreground">{declaration.member.mobile}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Review Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {declaration.status === 'PENDING' ? (
                <p className="text-sm text-muted-foreground">Awaiting review</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Reviewed By</p>
                    <p className="text-sm text-ink mt-1">{declaration.reviewer.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Reviewed At</p>
                    <p className="text-sm text-ink mt-1">
                      {declaration.reviewAt ? formatDate(declaration.reviewAt) : '-'}
                    </p>
                  </div>
                  {declaration.remark && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Remark</p>
                      <p className="text-sm text-ink mt-1">{declaration.remark}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

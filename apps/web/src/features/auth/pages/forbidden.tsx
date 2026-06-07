'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { useAuthStore } from '@store/auth';
import { Link } from '@tanstack/react-router';

/**
 * ForbiddenPage component displays a 403 Access Denied message.
 * It provides options to go back home or sign in if the user is not authenticated.
 * Used when a user attempts to access a resource they don't have permission for.
 */
export function ForbiddenPage() {
  const { isSignedIn } = useAuthStore();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
      <Card className="w-full max-w-md border-hairline bg-surface-card">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-normal tracking-tight text-ink">
            Access Denied
          </CardTitle>
          <CardDescription className="text-body text-base">
            You don't have permission to access this page. Please check your credentials or contact
            an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-6xl font-normal tracking-tight text-muted-soft">
            403
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="h-11 border-hairline bg-surface-strong px-5 text-base font-semibold text-ink hover:bg-surface-strong/80"
          >
            <Link to="/">Go back home</Link>
          </Button>
          {!isSignedIn && (
            <Button
              asChild
              className="h-11 bg-primary px-5 text-base font-semibold text-on-primary hover:bg-primary-active"
            >
              <Link to="/sign-in">Sign in</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

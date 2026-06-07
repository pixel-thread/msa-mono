'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { Card, CardContent,CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useResetPassword } from '@feature/auth/hooks';
import { type ResetPasswordInput,ResetPasswordSchema } from '@feature/auth/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link,useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

/**
 * ResetPasswordPage component handles the password reset process.
 * It requires a valid reset token from the URL search parameters.
 * Validates the new password using Zod and handles success/error states.
 */
export function ResetPasswordPage() {
  const searchParams = useSearch({ strict: false }) as Record<string, string | undefined>;
  const token = searchParams.token;
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
    },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      await resetPasswordMutation.mutateAsync(values);
      setIsSuccess(true);
    } catch {}
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
        <Card className="w-full max-w-md border-hairline bg-surface-card">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-normal tracking-tight text-ink">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-body text-base">
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-active"
            >
              Request new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
        <Card className="w-full max-w-md border-hairline bg-surface-card">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-normal tracking-tight text-ink">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-body text-base">
              Your password has been reset successfully. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/sign-in"
              className="text-sm font-medium text-primary hover:text-primary-active"
            >
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
      <Card className="w-full max-w-md border-hairline bg-surface-card">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-normal tracking-tight text-ink">
            Reset your password
          </CardTitle>
          <CardDescription className="text-body text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {resetPasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {resetPasswordMutation.error?.message || 'Password reset failed'}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => <input type="hidden" {...field} />}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-strong text-sm font-medium">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        className="h-12 border-hairline bg-canvas text-ink placeholder:text-muted-foreground focus-visible:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-11 w-full bg-primary px-5 text-base font-semibold text-on-primary hover:bg-primary-active disabled:bg-primary-disabled"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
              </Button>

              <div className="text-center">
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-primary hover:text-primary-active"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

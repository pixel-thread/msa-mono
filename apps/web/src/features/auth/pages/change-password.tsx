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
import { useChangePassword } from '@feature/auth/hooks';
import { type ChangePasswordInput,ChangePasswordSchema } from '@feature/auth/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

/**
 * Change Password page component.
 * Allows authenticated users to update their password by providing
 * their current password and a new one.
 */
export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const changePasswordMutation = useChangePassword();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    try {
      await changePasswordMutation.mutateAsync(values);
      setIsSuccess(true);
    } catch {}
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
        <Card className="w-full max-w-md border-hairline bg-surface-card">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-normal tracking-tight text-ink">
              Password Changed
            </CardTitle>
            <CardDescription className="text-body text-base">
              Your password has been changed successfully. Please sign in again with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="h-11 w-full bg-primary px-5 text-base font-semibold text-on-primary hover:bg-primary-active"
              onClick={() => navigate({ to: '/sign-in' })}
            >
              Go to sign in
            </Button>
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
            Change your password
          </CardTitle>
          <CardDescription className="text-body text-base">
            Enter your current password and a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {changePasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {changePasswordMutation.error?.message || 'Password change failed'}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-strong text-sm font-medium">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Current password"
                        className="h-12 border-hairline bg-canvas text-ink placeholder:text-muted-foreground focus-visible:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-strong text-sm font-medium">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
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
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change password'}
              </Button>

              <div className="text-center">
                <Button variant={'link'} onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

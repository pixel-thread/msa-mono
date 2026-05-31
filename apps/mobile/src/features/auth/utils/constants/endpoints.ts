export const authEndpoints = {
  signIn: '/auth/sign-in',
  signInVerify: '/auth/sign-in/verify',
  signUp: '/auth/sign-up',
  resendSignInVerifyCode: '/auth/sign-in/resend',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  signOut: '/auth/logout',
} as const;

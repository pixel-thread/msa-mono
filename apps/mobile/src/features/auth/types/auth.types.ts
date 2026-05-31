import { UserRole } from '@src/shared/types/role';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole[];
  mfaEnabled: boolean;
}

export interface SignInResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole[];
  mfaEnabled: boolean;
}

export interface SignInMfaResponse {
  tempToken: string;
}

export interface SignUpResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole[];
}

export interface MfaSetupResponse {
  pending: true;
  codeSent: true;
}

export interface SignInVerifyResponse {
  mfaEnabled: true;
}

export interface MfaResendResponse {
  codeSent: true;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

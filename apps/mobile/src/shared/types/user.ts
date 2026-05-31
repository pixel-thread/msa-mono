import { UserRole } from './role';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole[];
  mfaEnabled: boolean;
  designation: string | null;
  dateOfJoiningGovt: Date | null;
  dateOfJoiningMfsa: Date | null;
  mobile: string | null;
}

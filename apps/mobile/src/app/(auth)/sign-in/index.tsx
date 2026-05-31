import { SignInScreen } from '@features/auth/screens';
import { Container } from '@src/shared/components';

export default function SignInPage() {
  return (
    <Container className="flex-1">
      <SignInScreen />
    </Container>
  );
}

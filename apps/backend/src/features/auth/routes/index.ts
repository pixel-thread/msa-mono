import { auth } from '@middleware/auth';
import { routeRateLimiter } from '@middleware/rate-limiter';
import { Router } from 'express';

import { postMfaDisable } from './mfa/disable.route';
import { postMfaResend } from './mfa/resend.route';
import { postMfaSetup } from './mfa/setup.route';
import { postMfaVerify } from './mfa/verify.route';
import { postChangePassword } from './change-password.route';
import { postForgotPassword } from './forgot-password.route';
import { postLogout } from './logout.route';
import { getMe } from './me.route';
import { postRefresh } from './refresh.route';
import { postResetPassword } from './reset-password.route';
import { postSignIn } from './sign-in.route';
import { postSignInResend } from './sign-in-resend.route';
import { postSignInVerify } from './sign-in-verify.route';
import { postSignUp } from './sign-up.route';

// ---- Auth Router ----

/** Aggregates all authentication-related route handlers under a single router. */
const router: Router = Router();
router.use(routeRateLimiter(40, '60 s'));

// ---- Public auth routes ----
router.post('/sign-up', postSignUp);
router.post('/sign-in', postSignIn);
router.post('/sign-in/verify', postSignInVerify);
router.post('/sign-in/resend', postSignInResend);
router.post('/refresh', postRefresh);
router.post('/forgot-password', postForgotPassword);
router.post('/reset-password', postResetPassword);

// ---- Protected auth routes (require auth middleware) ----
router.get('/me', auth, getMe);
router.post('/logout', auth, postLogout);
router.post('/change-password', auth, postChangePassword);

// ---- MFA routes (all require auth middleware) ----
router.post('/mfa/setup', auth, postMfaSetup);
router.post('/mfa/verify', auth, postMfaVerify);
router.post('/mfa/resend', auth, postMfaResend);
router.post('/mfa/disable', auth, postMfaDisable);

export default router;

# Security Control Requirements

## Authentication
1. Require authentication for all pages and resources, except those specifically intended to be public
2. All authentication controls should fail securely
3. Only cryptographically strong one-way salted hashes of passwords are stored
4. Authentication failure responses should not indicate which part of the authentication data was incorrect. For example, instead of "Invalid username" or "Invalid password", just use "Invalid username and/or password" for both
5. Enforce password complexity requirements established by policy or regulation
6. Enforce password length requirements established by policy or regulation
7. Password entry should be obscured on the user's screen (use of dots or asterisks on the display)
8. Enforce account disabling after an established number of invalid login attempts (e.g., five attempts is common). The account be disabled for a period of time sufficient to discourage brute force guessing of credentials, but not so long as to allow for a denial-ofservice attack to be performed
9. Password reset questions should support sufficiently random answers. (e.g., "favorite book" is a bad question because “The Bible” is a very common answer)
10.  Prevent password re-use
11.  Passwords should be at least one day old before they can be changed, to prevent
attacks on password re-use
12.  The last use (successful or unsuccessful) of a user account should be reported to the user at their next successful login
13.  Re-authenticate users prior to performing critical operations such as password change

## Authorization/Access Control
1. Use a single site-wide component to check access authorization
2. Access controls should fail securely
3. Enforce application logic flows to comply with business rules

## Data Validation
1. All validation failures should result in input rejection. Sanitizing should not be used.
2. Validate data range
3. Validate data length

## Error Handling and Logging
1. Use error handlers that do not display debugging or stack trace information
2. Implement generic error messages and use custom error pages
3. Logging controls should support both success and failure of specified security events
4. Restrict access to logs to only website administrators
5. Log all input validation failures
6. Log all authentication attempts, especially failures
7. Log all access control failures

---

## Accomplished Controls (Current Implementation)

### Authentication (1) | Require authentication for all non-public pages/resources
SSWA/src/hooks.server.ts
```ts
const PUBLIC_PATH_PREFIXES = ['/login', '/register', '/forgot-password'];

if (!event.locals.user && !publicPath) {
  throw redirect(303, '/login');
}
```

---

### Authentication (2) | Authentication controls fail securely
SSWA/src/hooks.server.ts
```ts
event.locals.user = null;
event.locals.session = null;

if (token) {
  const authSession = await getSessionFromToken(token);
  if (authSession) {
    event.locals.user = authSession.user;
    event.locals.session = authSession.session;
  }
}
```

SSWA/src/lib/server/auth/service.ts
```ts
if (user.status === UserStatus.DISABLED) {
  return { ok: false, message: genericFailureMessage };
}

if (user.lockoutUntil && user.lockoutUntil > new Date()) {
  return { ok: false, message: genericFailureMessage };
}
```

---

### Authentication (3) | Store strong one-way salted password hashes
SSWA/src/lib/server/auth/password.ts
```ts
const salt = randomBytes(16);
const derivedKey = await deriveKey(password, salt, KEY_LENGTH);

return [
  'scrypt',
  SCRYPT_N.toString(),
  SCRYPT_R.toString(),
  SCRYPT_P.toString(),
  salt.toString('base64url'),
  derivedKey.toString('base64url')
].join('$');
```

SSWA/prisma/schema.prisma
```prisma
model User {
  passwordHash String
  ...
}
```

---

### Authentication (4) | Generic authentication failure response
SSWA/src/lib/server/auth/service.ts
```ts
const genericFailureMessage = 'Invalid username and/or password.';

if (!user) {
  return { ok: false, message: genericFailureMessage };
}
```

---

### Authentication (5) | Password complexity requirement
SSWA/src/routes/register/+page.server.ts
```ts
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

if (!PASSWORD_POLICY.test(password)) {
  return fail(400, {
    error:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
  });
}
```

---

### Authentication (6) | Password length requirement
SSWA/src/routes/register/+page.server.ts
```ts
const MIN_PASSWORD_LENGTH = 12;

if (password.length < MIN_PASSWORD_LENGTH) {
  return fail(400, {
    error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  });
}
```

---

### Authentication (7) | Password fields are obscured in UI
SSWA/src/routes/login/+page.svelte
```svelte
<input
  name="password"
  type="password"
  autocomplete="current-password"
  required
/>
```

SSWA/src/routes/register/+page.svelte
```svelte
<input name="password" type="password" autocomplete="new-password" required />
<input name="confirmPassword" type="password" autocomplete="new-password" required />
```

---

### Authentication (8) | Account lockout after failed login attempts
SSWA/src/lib/server/auth/service.ts
```ts
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const failedLoginCount = user.failedLoginCount + 1;
const shouldLock = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS;

await prisma.user.update({
  where: { id: user.id },
  data: {
    failedLoginCount,
    lastLoginFailureAt: new Date(),
    lockoutUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
    status: shouldLock ? UserStatus.LOCKED : user.status
  }
});
```

---

### Authentication (9) | Password reset questions support sufficiently random answers
SSWA/src/lib/server/auth/password-policy.ts
```ts
export const MIN_RESET_ANSWER_LENGTH = 12;
const RESET_ANSWER_POLICY = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function validateResetChallenge(question: string, answer: string): string | null {
  if (!question || question.trim().length < 10) {
    return 'Security question must be at least 10 characters long.';
  }

  if (answer.length < MIN_RESET_ANSWER_LENGTH) {
    return `Security answer must be at least ${MIN_RESET_ANSWER_LENGTH} characters long.`;
  }

  if (!RESET_ANSWER_POLICY.test(answer)) {
    return 'Security answer must include letters and numbers for stronger entropy.';
  }

  return null;
}
```

SSWA/src/routes/register/+page.server.ts
```ts
const resetChallengeError = validateResetChallenge(resetQuestion, resetAnswer);
if (resetChallengeError) {
  await logValidationFailure({
    actorUserId: locals.user?.id,
    route: url.pathname,
    ip: getClientAddress(),
    userAgent: request.headers.get('user-agent'),
    reason: 'reset_challenge_policy_violation',
    fields: ['resetQuestion', 'resetAnswer']
  });

  return fail(400, { error: resetChallengeError });
}
```

---

### Authentication (10) | Prevent password re-use
SSWA/src/lib/server/auth/service.ts
```ts
async function isPasswordReused(userId: string, proposedPassword: string): Promise<boolean> {
  const historyEntries = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { passwordHash: true }
  });

  for (const historyEntry of historyEntries) {
    if (await verifyPassword(proposedPassword, historyEntry.passwordHash)) {
      return true;
    }
  }

  return false;
}

if (await isPasswordReused(user.id, params.proposedPassword)) {
  return {
    ok: false,
    message: 'Password re-use is not allowed.',
    validationError: true
  };
}
```

---

### Authentication (11) | Password minimum age before change
SSWA/src/lib/server/auth/password-policy.ts
```ts
export const MIN_PASSWORD_AGE_MS = 24 * 60 * 60 * 1000;
```

SSWA/src/lib/server/auth/service.ts
```ts
const ageMs = Date.now() - user.passwordChangedAt.getTime();
if (ageMs < MIN_PASSWORD_AGE_MS) {
  return {
    ok: false,
    message: 'Password must be at least one day old before it can be changed again.',
    validationError: true
  };
}
```

---

### Authentication (12) | Report last successful/unsuccessful account use at next login
SSWA/src/lib/server/auth/service.ts
```ts
const previousSuccessfulLoginAt = user.lastLoginSuccessAt;
const previousFailedLoginAt = user.lastLoginFailureAt;

return {
  ok: true,
  user: toAuthUser(user),
  sessionToken,
  lastAccountUse: {
    previousSuccessfulLoginAt,
    previousFailedLoginAt
  }
};
```

SSWA/src/routes/login/+page.server.ts
```ts
setLastAccountUseNoticeCookie(cookies, {
  previousSuccessfulLoginAt: result.lastAccountUse?.previousSuccessfulLoginAt?.toISOString() ?? null,
  previousFailedLoginAt: result.lastAccountUse?.previousFailedLoginAt?.toISOString() ?? null
});
```

SSWA/src/routes/+page.svelte
```svelte
{#if data.lastAccountUse}
  <div class="rounded border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
    <p class="font-medium">Previous account activity</p>
    <p>Last successful login: {data.lastAccountUse.previousSuccessfulLoginAt ? new Date(data.lastAccountUse.previousSuccessfulLoginAt).toLocaleString() : 'No previous successful login recorded'}</p>
    <p>Last unsuccessful login attempt: {data.lastAccountUse.previousFailedLoginAt ? new Date(data.lastAccountUse.previousFailedLoginAt).toLocaleString() : 'No failed attempt recorded'}</p>
  </div>
{/if}
```

---

### Authentication (13) | Re-authenticate users before critical operation (password change)
SSWA/src/lib/server/auth/service.ts
```ts
export async function changePasswordWithReauth(
  userId: string,
  currentPassword: string,
  newPassword: string,
  context: SecurityContext
): Promise<PasswordChangeResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true }
  });

  const verified = await verifyPassword(currentPassword, user.passwordHash);
  if (!verified) {
    await writeSecurityLog({
      actorUserId: user.id,
      eventType: 'AUTH_REAUTH',
      outcome: 'FAILURE',
      route: context.route,
      ip: context.ip,
      userAgent: context.userAgent,
      metadataJson: { reason: 'current_password_mismatch' }
    });

    return { ok: false, message: 'Current password is incorrect.', validationError: true };
  }
  ...
}
```

SSWA/src/routes/account/password/+page.server.ts
```ts
const result = await changePasswordWithReauth(locals.user!.id, currentPassword, newPassword, {
  ip: getClientAddress(),
  userAgent: request.headers.get('user-agent'),
  route: url.pathname
});
```

---

### Data Validation (1) | Validation failures reject input
SSWA/src/routes/register/+page.server.ts
```ts
if (!email || !password || !confirmPassword) {
  return fail(400, { error: 'Email and password fields are required.' });
}

if (password !== confirmPassword) {
  return fail(400, { error: 'Passwords do not match.' });
}
```

---

### Data Validation (3) | Validate data length
SSWA/src/routes/register/+page.server.ts
```ts
if (password.length < MIN_PASSWORD_LENGTH) {
  return fail(400, {
    error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  });
}
```

---

### Error Handling and Logging (2) | Generic error messages
SSWA/src/lib/server/auth/service.ts
```ts
const genericFailureMessage = 'Invalid username and/or password.';
```

SSWA/src/routes/login/+page.svelte
```svelte
{#if form?.error}
  <p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
{/if}
```

---

### Error Handling and Logging (3) | Log success and failure of security events
SSWA/src/lib/server/auth/service.ts
```ts
await writeSecurityLog({
  actorUserId: user.id,
  eventType: 'AUTH_LOGIN',
  outcome: 'SUCCESS',
  route: context.route,
  ip: context.ip,
  userAgent: context.userAgent
});

await writeSecurityLog({
  eventType: 'AUTH_LOGIN',
  outcome: 'FAILURE',
  route: context.route,
  ip: context.ip,
  userAgent: context.userAgent,
  metadataJson: { reason: 'user_not_found', email: normalizedEmail }
});
```

---

### Error Handling and Logging (6) | Log all authentication attempts (especially failures)
SSWA/src/lib/server/auth/service.ts
```ts
if (!user) {
  await writeSecurityLog({
    eventType: 'AUTH_LOGIN',
    outcome: 'FAILURE',
    route: context.route,
    ip: context.ip,
    userAgent: context.userAgent,
    metadataJson: { reason: 'user_not_found', email: normalizedEmail }
  });
}

await writeSecurityLog({
  actorUserId: user.id,
  eventType: 'AUTH_LOGIN',
  outcome: 'SUCCESS',
  route: context.route,
  ip: context.ip,
  userAgent: context.userAgent
});
```

---

### Error Handling and Logging (4) | Restrict access to logs to only website administrators
SSWA/src/lib/server/authorization/policy.ts
```ts
const ROUTE_RULES: AuthorizationRule[] = [
  { pathPrefix: '/admin', roles: [UserRole.ADMIN] },
  { pathPrefix: '/manager', roles: [UserRole.ADMIN, UserRole.MANAGER] }
];
```

SSWA/src/routes/admin/logs/+page.server.ts
```ts
export const load: PageServerLoad = async ({ locals, url }) => {
  assertAllowedPath(url.pathname, locals.user);
  ...
};
```

SSWA/src/routes/admin/logs/+page.svelte
```svelte
<h1 class="text-2xl font-semibold">Security Logs (Admin Only)</h1>
```

---

### Error Handling and Logging (7) | Log all access control failures
SSWA/src/hooks.server.ts
```ts
if (event.locals.user && !publicPath && !isAllowedPath(pathname, event.locals.user)) {
  await writeSecurityLog({
    actorUserId: event.locals.user.id,
    eventType: 'AUTHZ_ACCESS',
    outcome: 'DENIED',
    route: pathname,
    ip: event.getClientAddress(),
    userAgent: event.request.headers.get('user-agent'),
    metadataJson: {
      reason: 'route_policy_denied',
      role: event.locals.user.role
    }
  });

  throw redirect(303, '/forbidden');
}
```

SSWA/src/routes/manager/users/+page.server.ts
```ts
if (!canManageUser(locals.user, targetUser)) {
  await writeSecurityLog({
    actorUserId: locals.user.id,
    eventType: 'AUTHZ_ACCESS',
    outcome: 'DENIED',
    route: url.pathname,
    metadataJson: {
      reason: 'scope_or_role_restriction',
      targetUserId: targetUser.id,
      targetUserRole: targetUser.role,
      actorRole: locals.user.role
    }
  });

  return fail(403, { error: 'Access denied.' });
}
```

---

### Error Handling and Logging (1) | Safe error handlers without exposing debug/stack details
SSWA/src/hooks.server.ts
```ts
export const handleError: HandleServerError = async ({ error, event }) => {
  await writeSecurityLog({
    actorUserId: event.locals.user?.id,
    eventType: 'TASK_CRUD',
    outcome: 'FAILURE',
    route: event.url.pathname,
    ip: event.getClientAddress(),
    userAgent: event.request.headers.get('user-agent'),
    metadataJson: {
      reason: 'unhandled_server_error'
    }
  });

  console.error(error);

  return {
    message: 'Something went wrong. Please try again later.'
  };
};
```

SSWA/src/routes/+error.svelte
```svelte
<h1 class="text-2xl font-semibold">Something went wrong</h1>
<p class="text-gray-600">{page.error?.message ?? 'An unexpected error occurred.'}</p>
```

---

### Error Handling and Logging (5) | Log all input validation failures
SSWA/src/lib/server/logging/security-log.ts
```ts
export async function logValidationFailure(params: {
  actorUserId?: string;
  route: string;
  ip?: string | null;
  userAgent?: string | null;
  reason: string;
  fields?: string[];
}): Promise<void> {
  await writeSecurityLog({
    actorUserId: params.actorUserId,
    eventType: 'VALIDATION',
    outcome: 'FAILURE',
    route: params.route,
    ip: params.ip,
    userAgent: params.userAgent,
    metadataJson: {
      reason: params.reason,
      fields: params.fields ?? []
    }
  });
}
```

SSWA/src/routes/register/+page.server.ts
```ts
if (!PASSWORD_POLICY.test(password)) {
  await logValidationFailure({
    actorUserId: locals.user?.id,
    route: url.pathname,
    ip: getClientAddress(),
    userAgent: request.headers.get('user-agent'),
    reason: 'password_complexity_violation',
    fields: ['password']
  });

  return fail(400, {
    error:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
  });
}
```

SSWA/src/routes/login/+page.server.ts
```ts
if (!email || !password) {
  await logValidationFailure({
    actorUserId: locals.user?.id,
    route: url.pathname,
    ip: getClientAddress(),
    userAgent: request.headers.get('user-agent'),
    reason: 'missing_required_fields',
    fields: ['email', 'password']
  });

  return fail(400, { error: 'Email and password are required.' });
}
```

SSWA/src/routes/manager/users/+page.server.ts
```ts
if (nextStatus !== UserStatus.ACTIVE && nextStatus !== UserStatus.DISABLED) {
  await logValidationFailure({
    actorUserId: locals.user.id,
    route: url.pathname,
    ip: getClientAddress(),
    userAgent: request.headers.get('user-agent'),
    reason: 'invalid_status_value',
    fields: ['nextStatus']
  });

  return fail(400, { error: 'Invalid status value.' });
}
```

---

### Authorization/Access Control (1) | Single site-wide authorization component
SSWA/src/lib/server/authorization/policy.ts
```ts
const ROUTE_RULES: AuthorizationRule[] = [
  { pathPrefix: '/admin', roles: [UserRole.ADMIN] },
  { pathPrefix: '/manager', roles: [UserRole.ADMIN, UserRole.MANAGER] }
];

export function isAllowedPath(pathname: string, user: App.Locals['user']): boolean {
  if (!user) {
    return false;
  }

  const matchedRule = ROUTE_RULES.find(
    (rule) => pathname === rule.pathPrefix || pathname.startsWith(`${rule.pathPrefix}/`)
  );

  if (!matchedRule) {
    return true;
  }

  return matchedRule.roles.includes(user.role);
}
```

SSWA/src/hooks.server.ts
```ts
if (event.locals.user && !publicPath && !isAllowedPath(pathname, event.locals.user)) {
  throw redirect(303, '/forbidden');
}
```

---

### Authorization/Access Control (2) | Access controls fail securely
SSWA/src/lib/server/authorization/policy.ts
```ts
export function assertAllowedPath(pathname: string, user: App.Locals['user']): asserts user is CurrentUser {
  if (!isAllowedPath(pathname, user)) {
    throw error(403, 'Access denied.');
  }
}
```

SSWA/src/routes/admin/logs/+page.server.ts
```ts
export const load: PageServerLoad = async ({ locals, url }) => {
  assertAllowedPath(url.pathname, locals.user);
  ...
};
```

---

### Authorization/Access Control (3) | Enforce business logic flows with role/scope rules
SSWA/src/lib/server/authorization/policy.ts
```ts
export function canManageUser(actor: CurrentUser, target: { role: UserRole; scopeId: string | null }): boolean {
  if (actor.role === UserRole.ADMIN) {
    return true;
  }

  if (actor.role === UserRole.MANAGER) {
    return target.role === UserRole.USER && actor.scopeId !== null && actor.scopeId === target.scopeId;
  }

  return false;
}
```

SSWA/src/routes/manager/users/+page.server.ts
```ts
if (locals.user.role === UserRole.ADMIN) {
  const users = await prisma.user.findMany({ ... });
  return { users };
}

const users = await prisma.user.findMany({
  where: {
    role: UserRole.USER,
    scopeId: locals.user.scopeId
  },
  ...
});

if (!canManageUser(locals.user, targetUser)) {
  return fail(403, { error: 'Access denied.' });
}
```

---

## Not Yet Implemented (Pending)

- Data Validation (2)


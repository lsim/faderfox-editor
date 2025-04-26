import { JWTPayload, jwtVerify, SignJWT } from 'npm:jose@6.0.10';
import { kv } from '../kv.ts';
import { Err, Ok } from '../util.ts';
import { sendMessage } from './mail.ts';

/*
 * Auth scheme:
 * - Read secret from disk (not committed to git, included when deploying)
 * - User registers with username and password
 * - Backend stores
 * - User logs in with username and password
 * - User is issued a JWT token signed with the secret
 * - User receives the token in the response to the login request
 * - User authenticates against the bundle api with an Authorization: Bearer <token> http header
 * - Backend validates the token by checking the signature against the secret
 * - Backend extracts userId from the payload
 * */

export class User {
  constructor(
    public username: string,
    public passwordDigest: string,
    public userId: string,
    public email?: string,
  ) {}
}

const rawSecret = Deno.env.get('JWT_ROOT_SECRET');

console.debug('Got secret?', !!rawSecret);

const encoder = new TextEncoder();

const secret = encoder.encode(rawSecret);

/* SignJWT expiry semantics:
Format used for time span should be a number followed by a unit, such as "5 minutes" or "1 day".
Valid units are: "sec", "secs", "second", "seconds", "s", "minute", "minutes", "min", "mins", "m", "hour", "hours",
                 "hr", "hrs", "h", "day", "days", "d", "week", "weeks", "w", "year", "years", "yr", "yrs", and "y".
It is not possible to specify months. 365.25 days is used as an alias for a year.
If the string is suffixed with "ago", or prefixed with a "-", the resulting time span gets subtracted from the
current unix timestamp. A "from now" suffix can also be used for readability when adding to the current unix timestamp.
 */
async function createJWT(payload: JWTPayload, expiration: string = '7d'): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Invalid JWT:', (error as { message: string }).message);
    return null;
  }
}

export async function getValidatedUser(token: string): Promise<User | null> {
  if (!token) return null;
  try {
    const payload = await verifyJWT(token);
    const userId = payload?.userId as string;
    const userEmail = payload?.email as string; // Recovery token
    if (!userId && !userEmail) return null;
    const userKey = userId ? userByIdKey(userId) : userByEmailKey(userEmail);

    const userRes = await kv.get<User>(userKey);
    return userRes.value;
  } catch (e) {
    console.log('Error verifying token', (e as { message: string }).message);
    return null;
  }
}

// Returns base64 encoded sha256 hash of the password
async function digestPassword(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

const userByNameKey = (name: string) => ['users', name];
const userByIdKey = (id: string) => ['users-by-id', id];
const userByEmailKey = (email?: string) => ['users-by-email', email || 'no-email'];

async function registerUser(username: string, password: string, email?: string) {
  const userNameKey = userByNameKey(username);
  const existingUserByName = await kv.get<User>(userNameKey);
  const userEmailKey = userByEmailKey(email);
  const existingUserByEmail = await kv.get<User>(userEmailKey);

  if (existingUserByName.value) return Err('User already exists', 409);
  if (existingUserByEmail?.value) return Err('Email already in use', 409);

  const userId = crypto.randomUUID();
  const userIdKey = userByIdKey(userId);
  const passwordDigest = await digestPassword(password);

  const newUser = new User(username, passwordDigest, userId, email);
  // Atomically check that the user still doesn't exist and then set the user
  await kv
    .atomic()
    .check(existingUserByName)
    .check(existingUserByEmail)
    .set(userNameKey, newUser)
    .set(userIdKey, newUser)
    .set(userEmailKey, newUser)
    .commit();

  const token = await createJWT({ userId });
  return Ok(token, 201);
}

async function loginUser(username: string, password: string) {
  const userKey = userByNameKey(username);
  const user = await kv.get<User>(userKey);

  if (!user.value) return Err('Invalid username', 404);

  const passwordDigest = await digestPassword(password);
  if (passwordDigest !== user.value.passwordDigest) {
    return Err('Invalid password', 401);
  }
  const token = await createJWT({ userId: user.value.userId });
  return Ok(token);
}

async function sendRecoveryEmail(email: string, redirectHost: string) {
  console.debug('Recovering email', email, redirectHost);
  if (!email) return Err('Email is required', 400);
  if (!redirectHost) return Err('Redirect host is required', 400);

  const recoveryToken = await createJWT({ email}, '15m');
  const link = `${redirectHost}#/password-reset/${recoveryToken}`;
  // Slow down to prevent abuse
  await new Promise(resolve => setTimeout(resolve, 3000));
  await sendMessage(email, 'Password recovery', `<a href="${link}">Click here to reset your password</a>`);
  return Ok('Recovery email sent');
}

async function resetPassword(newPassword: string, user: User) {
  console.debug('Reset password', !!newPassword, user.username)
  const passwordDigest = await digestPassword(newPassword);
  const newUser = new User(user.username, passwordDigest, user.userId, user.email);
  const userKey = userByIdKey(user.userId);
  await kv.set(userKey, newUser);
  // Log in user as a courtesy
  const token = await createJWT({ userId: user.userId });
  return Ok(token);
}

export async function handleAuthRequest(request: Request, action: string, user: User | null) {
  if (request.method !== 'POST') {
    return Err('Method no allowed', 405);
  }

  const rawJson = await request.json();
  // console.log('raw json', JSON.stringify(rawJson));
  const { username, password, email, host } = rawJson;

  switch (action) {
    case 'register':
      return registerUser(username, password, email);
    case 'login':
      return loginUser(username, password);
    case 'recovery':
      return sendRecoveryEmail(email, host);
    case 'reset':
      return user ? resetPassword(password, user) : Err('Not authorized', 401);
  }

  return Err('Invalid request', 500);
}

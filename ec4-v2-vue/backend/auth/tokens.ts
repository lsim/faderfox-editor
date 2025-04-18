import { JWTPayload, jwtVerify, SignJWT } from 'npm:jose@6.0.10';
import { kv } from '../kv.ts';

export class User {
  constructor(
    public username: string,
    public passwordDigest: string,
    public userId: string,
  ) {}
}

const rawSecret = Deno.env.get('JWT_ROOT_SECRET');

console.debug('Got secret?', !!rawSecret);

const encoder = new TextEncoder();

const secret = encoder.encode(rawSecret);

async function createJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('JWT is valid:', payload);
    return payload;
  } catch (error) {
    console.error('Invalid JWT:', error);
    return null;
  }
}

export async function getValidatedUser(token: string): Promise<User | null> {
  if (!token) return null;
  const payload = await verifyJWT(token);
  const userId = payload?.userId as string;
  if (!userId) return null;

  const userKey = ['users-by-id', userId];

  const userRes = await kv.get<User>(userKey);
  return userRes.value;
}

// const token = await createJWT({ userId: 123, username: 'john_doe' });
// console.log('Created JWT:', token);
// const verifiedPayload = await verifyJWT(token);
// console.log('Verified Payload:', verifiedPayload);

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

// Returns base64 encoded sha256 hash of the password
async function digestPassword(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function registerUser(username: string, password: string) {
  const userNameKey = ['users', username];
  const existingUserByName = await kv.get<User>(userNameKey);

  if (existingUserByName.value) return new Response('User already exists', { status: 409 });

  const userId = crypto.randomUUID();
  const userIdKey = ['users-by-id', userId];
  const passwordDigest = await digestPassword(password);

  const newUser = new User(username, passwordDigest, userId);
  // Atomically check that the user still doesn't exist and then set the user
  const res = await kv
    .atomic()
    .check(existingUserByName)
    .set(userNameKey, newUser)
    .set(userIdKey, newUser)
    .commit();

  if (!res.ok) return new Response('Failed to register user', { status: 500 });

  const token = await createJWT({ userId });
  return new Response(token, { status: 201 });
}

async function loginUser(username: string, password: string) {
  const userKey = ['users', username];
  const user = await kv.get<User>(userKey);

  if (!user.value) return new Response('User not found', { status: 404 });

  const passwordDigest = await digestPassword(password);
  if (passwordDigest !== user.value.passwordDigest) {
    return new Response('Invalid password', { status: 401 });
  }
  const token = await createJWT({ userId: user.value.userId });
  return new Response(token, { status: 200 });
}

export async function handleAuthRequest(request: Request, action: string) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { username, password } = await request.json();

  switch (action) {
    case 'register':
      return registerUser(username, password);
    case 'login':
      return loginUser(username, password);
  }

  return new Response('Unexpected action', { status: 500 });
}

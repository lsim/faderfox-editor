import { User } from './auth/tokens.ts';
import { kv } from './kv.ts';

export class Bundle {
  constructor(
    public name: string,
    public id: string,
    public timestamp: number,
    public authorId: string,
    public authorName?: string,
    public bytes?: Uint8Array,
  ) {}

  public async toBundleLight() {
    const user = await kv.get<User>(['users-by-id', this.authorId]);
    const authorName = user.value?.username;
    return new Bundle(this.name, this.id, this.timestamp, this.authorId, authorName);
  }
}

export async function getBundle(id: string) {
  if (!id) throw Error('No bundle id');
  const value = await kv.get(['bundles', id]);
  if (!value) throw Error(`No bundle found with id ${id}`);
  return value;
}

export async function getBundles() {
  const bundles = kv.list<Bundle>({ prefix: ['bundles'] });
  // Return bundles without the sysex payload
  const result = [];
  for await (const entry of bundles) {
    const b = entry.value;
    result.push(b.toBundleLight());
  }
  return result;
}

async function storeBundle(
  name: string,
  bytes: Uint8Array,
  timestamp: number,
  id: string | null,
  userId: string,
) {
  const bundleId = id || crypto.randomUUID();
  if (!name) return new Response('No bundle name', { status: 400 });
  if (!bytes || bytes.length === 0) return new Response('No bundle bytes', { status: 400 });
  if (!timestamp) return new Response('No bundle timestamp', { status: 400 });
  console.debug('Storing bundle', name, bundleId, timestamp, id, userId);
  const bundle = new Bundle(name, bundleId, timestamp, userId, undefined, bytes);
  await kv.set(['bundles', bundleId], bundle);
  return new Response(bundleId, { status: id ? 200 : 201 });
}

export async function handleBundleRequest(request: Request, id: string, user: User | null) {
  if (request.method === 'GET') {
    if (id) return new Response(JSON.stringify(await getBundle(id)));
    else return new Response(JSON.stringify(await getBundles()));
  } else if (request.method === 'POST') {
    if (!user) return new Response('Unauthorized', { status: 401 });
    const json = await request.json();
    console.debug('posted bundle json', json, id, user.userId);
    return storeBundle(json.name, json.bytes, json.timestamp, id, user.userId);
  }
  return new Response('Not found', { status: 404 });
}

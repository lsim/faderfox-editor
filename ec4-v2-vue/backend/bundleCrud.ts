import { User } from './auth/tokens.ts';
import { kv } from './kv.ts';

export async function getBundle(id: string) {
  if (!id) throw Error('No bundle id');
  const value = await kv.get(['bundles', id]);
  if (!value) throw Error(`No bundle found with id ${id}`);
  return value;
}

export async function getBundles() {
  const bundles = kv.list({ prefix: ['bundles'] });
}

export async function handleBundleRequest(request: Request, id: string, user: User | null) {
  if (request.method === 'GET') {
    if (id) return new Response(JSON.stringify(await getBundle(id)));
    else return new Response(JSON.stringify(await getBundles()));
  } else if (request.method === 'POST') {
    const json = await request.json();
    console.log('posted json', json, id);

    return new Response('OK');
  }
  return new Response('Not found', { status: 404 });
}

// export function add(a: number, b: number): number {
//   return a + b;
// }
//
// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// if (import.meta.main) {
//   console.log("Add 2 + 3 =", add(2, 3));
// }

import { handleBundleRequest } from './bundleCrud.ts';
import { getValidatedUser, handleAuthRequest } from './auth/tokens.ts';

Deno.serve({ port: 8088 }, async (request: Request) => {
  const url = new URL(request.url);

  const [, endpoint, arg1] = url.pathname.split('/');

  const [, token] = request.headers.get('Authorization')?.split(' ') ?? [];

  const user = await getValidatedUser(token || '');

  console.debug('request', request.method, url.pathname, endpoint, arg1, !!token, user?.username);
  switch (endpoint) {
    case 'bundles':
      return handleBundleRequest(request, arg1, user);
    case 'auth':
      return handleAuthRequest(request, arg1);
    default:
      return new Response('Not found', { status: 404 });
  }
});

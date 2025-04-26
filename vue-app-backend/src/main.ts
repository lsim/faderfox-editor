import { handlePublicationRequest } from './publications.ts';
import { getValidatedUser, handleAuthRequest } from './auth/tokens.ts';
import { Err, Ok } from './util.ts';
import { handleSubscriptionRequest } from './subscription.ts';

async function handleRequest(request: Request) {
  const url = new URL(request.url);

  const [, endpoint, arg1] = url.pathname.split('/');

  const [, token] = request.headers.get('Authorization')?.split(' ') ?? [];

  const user = token ? await getValidatedUser(token || '') : null;

  console.debug(`${request.method} ${url.pathname} by ${user?.username || '<anonymous>'}`);

  if (request.method === 'OPTIONS') {
    return Ok('');
  }
  switch (endpoint) {
    case 'publications':
      return await handlePublicationRequest(request, arg1, user);
    case 'auth':
      return await handleAuthRequest(request, arg1, user);
    case 'hello': // This endpoint serves as a quick authentication assurance
      if (!user) return Err('Unauthorized', 401);
      return Ok(user ? 'Hi ' + user.username : 'Hello stranger');
    case 'subscribe':
      return handleSubscriptionRequest(request);
    default:
      return Err('Invalid request', 500);
  }
}

function requestLimiter(maxTickets: number, handleRequest: (request: Request) => Promise<Response>) {
  let tickets = maxTickets;
  setInterval(() => {
    tickets = Math.min(maxTickets, tickets + 1);
  }, 500);

  return async function requestLimiter(request: Request) {
    if (tickets === 0) return new Response(null, { status: 503 }); // Service Unavailable
    tickets--;
    return await handleRequest(request);
  }
}

Deno.serve({ port: 8088 }, requestLimiter(100, handleRequest));

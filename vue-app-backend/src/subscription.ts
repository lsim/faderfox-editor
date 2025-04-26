import { Err } from './util.ts';

const subscriptions = new Map<string, WebSocket>();

export function handleSubscriptionRequest(request: Request) {
  if (request.headers.get('upgrade') != 'websocket') {
    return Err('', 501);
  }

  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.addEventListener('message', (event) => {
    if (event.data === 'ping') {
      socket.send('pong');
    }
  });

  const id = crypto.randomUUID();
  socket.addEventListener('open', () => {
    console.debug('Socket opened', id);
    subscriptions.set(id, socket);
  });

  socket.addEventListener('close', () => {
    console.debug('Socket closed', id);
    subscriptions.delete(id);
  });

  return response;
}

export function broadcast(message: object) {
  for (const [, socket] of subscriptions) {
    socket.send(JSON.stringify(message));
  }
}

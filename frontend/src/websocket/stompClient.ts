import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const wsUrl = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/api/ws';

export function createStompClient(onConnect?: () => void) {
  const client = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => onConnect?.(),
    onStompError: (frame) => {
      console.error('STOMP error', frame.headers['message'], frame.body);
    },
  });

  return client;
}

export function subscribeSprintChat(
  client: Client,
  sprintId: number,
  handler: (body: string) => void,
) {
  return client.subscribe(`/topic/sprints/${sprintId}/chat`, (message) => {
    handler(message.body);
  });
}

export function subscribeUserNotifications(
  client: Client,
  userId: number,
  handler: (body: string) => void,
) {
  return client.subscribe(`/topic/users/${userId}/notifications`, (message) => {
    handler(message.body);
  });
}

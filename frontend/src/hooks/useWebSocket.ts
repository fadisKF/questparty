import { useEffect, useRef } from 'react';
import type { Client } from '@stomp/stompjs';
import { createStompClient } from '@/websocket/stompClient';
import { useAuthStore } from '@/store/authStore';

/** Подключение STOMP; уведомления и чат — этап 2 */
export function useWebSocket(onConnect?: (client: Client) => void) {
  const user = useAuthStore((s) => s.user);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!user) return;

    const client = createStompClient(() => onConnect?.(client));
    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [user?.id, onConnect]);

  return clientRef;
}

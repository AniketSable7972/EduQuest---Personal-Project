import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useContestWebSocket(roomId, { onLeaderboard, onStatus }) {
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    if (!roomId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/contest/${roomId}/leaderboard`, (msg) => {
          onLeaderboard?.(JSON.parse(msg.body));
        });
        client.subscribe(`/topic/contest/${roomId}/status`, (msg) => {
          onStatus?.(JSON.parse(msg.body));
        });
      },
    });

    client.activate();
    clientRef.current = client;
  }, [roomId, onLeaderboard, onStatus]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);
}

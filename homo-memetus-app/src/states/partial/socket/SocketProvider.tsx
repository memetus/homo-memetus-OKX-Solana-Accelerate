'use client';
import { SocketClient, SocketType } from '@/shared/types/etc/socket';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { SocketContext } from '@/states/partial/socket/SocketContext';
import { io } from 'socket.io-client';

type Props = {
  children: ReactNode;
  socketType: SocketType;
};

const SocketProvider = <T extends SocketType>({
  children,
  socketType,
}: Props & { socketType: T }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useState<SocketClient<T> | null>(
    null,
  );

  useEffect(() => {
    const socket: SocketClient<T> = io(
      `${process.env.NEXT_PUBLIC_API_URL}/${socketType}`,
      {
        transports: ['websocket'],
        addTrailingSlash: true,
        rejectUnauthorized: false,
        agent: false,
        upgrade: false,
      },
    ).connect();

    setSocketClient(socket);

    function onError(error: Error) {
      throw new Error(error.message);
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error', onError);

      socket.disconnect();
    };
  }, []);

  const contextValue = useMemo(() => {
    return {
      type: socketType,
      isConnected,
      socketClient,
    };
  }, [isConnected, socketClient]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

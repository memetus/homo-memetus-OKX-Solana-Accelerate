import { SocketClient, SocketType } from '@/shared/types/etc/socket';
import { Context, createContext, useContext } from 'react';

export type SocketContextShape<T extends SocketType = SocketType> = {
  type: SocketType | null;
  isConnected: boolean;
  socketClient: SocketClient<T> | null;
};

const defaultValue: SocketContextShape = {
  type: null,
  isConnected: false,
  socketClient: null,
};

export const SocketContext: Context<SocketContextShape> =
  createContext<SocketContextShape>(defaultValue);

export const useSocket = <T extends SocketType = SocketType>() => {
  return useContext(SocketContext) as SocketContextShape<T>;
};

import { StrategyCreateResponse } from '@/shared/types/data/api.type';
import { Socket } from 'socket.io-client';

export type SocketType = 'strategy';

export interface BaseSocketEvent {
  basicEmit: (event: string, data: Buffer) => void;
  error: (error: Error) => void;
}

export interface StrategySocketEvent extends BaseSocketEvent {
  strategy: (data: StrategyCreateResponse) => void;
}

export type StrategySocketType = Socket<StrategySocketEvent>;

export type SocketClientMap = {
  strategy: StrategySocketType;
};

export type SocketClient<T extends SocketType> = SocketClientMap[T];

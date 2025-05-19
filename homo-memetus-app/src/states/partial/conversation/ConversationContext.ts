import {
  ConversationStatus,
  ConversationTokenResult,
  ConversationType,
} from '@/shared/types/data/conversation.type';
import {
  Context,
  Dispatch,
  createContext,
  SetStateAction,
  useContext,
} from 'react';

export type ConversationContextShape = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  conversations: ConversationType[];
  setConversations: Dispatch<SetStateAction<ConversationType[]>>;
  strategy: string;
  setStrategy: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  lastMessage: ConversationType | null;
  setLastMessage: Dispatch<SetStateAction<ConversationType | null>>;
  status: ConversationStatus;
  setStatus: Dispatch<SetStateAction<ConversationStatus>>;
  tokenResult: ConversationTokenResult | null;
  setTokenResult: Dispatch<SetStateAction<ConversationTokenResult | null>>;
  tokenGenerating: boolean;
};

const defaultValue: ConversationContextShape = {
  input: '',
  setInput: () => {},
  conversations: [],
  setConversations: () => {},
  strategy: '',
  setStrategy: () => {},
  isLoading: false,
  setIsLoading: () => {},
  lastMessage: null,
  setLastMessage: () => {},
  status: 'start',
  setStatus: () => {},
  tokenResult: null,
  setTokenResult: () => {},
  tokenGenerating: false,
};

export const ConversationContext: Context<ConversationContextShape> =
  createContext<ConversationContextShape>(defaultValue);

export const useConversation = () => {
  return useContext(ConversationContext);
};

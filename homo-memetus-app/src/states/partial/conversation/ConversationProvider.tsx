import {
  ConversationStatus,
  ConversationTokenResult,
  ConversationType,
} from '@/shared/types/data/conversation.type';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { ConversationContext } from '@/states/partial/conversation/ConversationContext';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  initialAIMessage,
  promptAgentTemplate,
} from '@/shared/constants/agent';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { BufferMemory } from 'langchain/memory';
import {
  handleGeneratePrompt,
  handleOutputFormat,
  parseTokenAggregation,
} from '@/shared/lib/prompt';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getUsedCount } from '@/shared/api/strategy/api';
import { getCookie } from 'cookies-next';

type Props = {
  children: ReactNode;
};

const ConversationProvider = ({ children }: Props) => {
  const apiKey = `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`;
  const model = new ChatOpenAI({
    apiKey,
    model: `${process.env.NEXT_PUBLIC_MARKET_ANALYSIS_MODEL_ID}`,
    temperature: 0,
  });
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: 'history',
  });
  const [input, setInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [strategy, setStrategy] = useState<string>('');
  const [lastMessage, setLastMessage] = useState<ConversationType | null>(null);
  const [tokenResult, setTokenResult] =
    useState<ConversationTokenResult | null>(null);
  const [status, setStatus] = useState<ConversationStatus>('start');
  const [tokenGenerating, setTokenGenerating] = useState<boolean>(false);
  let content = '';

  useEffect(() => {
    const messages = conversations.map((c) => {
      if (c.type === 'user') return new HumanMessage(c.content);
      else if (c.type === 'assistant') return new AIMessage(c.content);
    });

    const getLLMResponse = async (userPrompt: string) => {
      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(promptAgentTemplate),
        new AIMessage(initialAIMessage),
        ...(messages as any),
        new HumanMessage(userPrompt),
      ]);

      const chain = prompt.pipe(model);
      const historyMessages = await memory.chatHistory.getMessages();

      const format = prompt.format({
        input: {},
        history: historyMessages,
      });

      const stream = await chain.stream({
        prompt: format,
        memory,
      });
      lastMessage &&
        setConversations([
          ...conversations,
          { ...lastMessage, handler: undefined },
        ]);

      for await (const chunk of stream) {
        content += chunk?.content;
        setLastMessage({
          type: 'assistant',
          content: content,
        });
      }

      if (content.includes('confirm')) {
        setLastMessage({
          type: 'assistant',
          content: content,
          handler: {
            name: 'confirm',
            onClick: async () => {
              setIsGenerating(true);
              setTokenGenerating(true);
              const token = (await handleGeneratePrompt(
                content,
              )) as ConversationTokenResult;
              setTokenGenerating(false);
              setIsGenerating(false);
              setTokenResult({
                ...token,
              });
              setStatus('end');
            },
          },
        });
      }

      setIsGenerating(false);
    };
    if (lastMessage && lastMessage.type === 'user') {
      content = '';
      if (!isGenerating) {
        const userPrompt = lastMessage.content;
        getLLMResponse(userPrompt);
        setIsGenerating(true);
      }
    }
  }, [conversations, lastMessage, content, isGenerating]);

  const contextValue = useMemo(() => {
    return {
      input,
      setInput,
      conversations,
      setConversations,
      strategy,
      setStrategy,
      isLoading: isGenerating,
      setIsLoading: setIsGenerating,
      lastMessage,
      setLastMessage,
      status,
      setStatus,
      tokenResult,
      setTokenResult,
      tokenGenerating,
    };
  }, [
    input,
    conversations,
    strategy,
    isGenerating,
    lastMessage,
    content,
    status,
    tokenResult,
    tokenGenerating,
  ]);
  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

export default ConversationProvider;

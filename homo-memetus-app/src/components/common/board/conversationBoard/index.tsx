import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from '@/components/common/board/conversationBoard/ConversationBoard.module.scss';
import classNames from 'classnames/bind';
import { useConversation } from '@/states/partial/conversation/ConversationContext';
import { ConversationType } from '@/shared/types/data/conversation.type';
import ConversationCard from '@/components/common/card/conversationCard';
import {
  promptAgentExhausted,
  promptAgentIntroduce,
} from '@/shared/constants/agent';
import TokenResultCard from '@/components/common/card/tokenResultCard';
import LoadingChatCard from '../../card/loadingChatCard';
import { useDispatch } from 'react-redux';
import { SET_TOAST } from '@/states/global/slice/toast';
import { getUsedCount, updateUseCount } from '@/shared/api/strategy/api';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getCookie } from 'cookies-next';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

const ConversationBoard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { connected } = useWallet();
  const [useCount, setUseCount] = useState<number | undefined>(undefined);
  const {
    conversations,
    lastMessage,
    setStatus,
    status,
    tokenResult,
    setConversations,
    setLastMessage,
    setInput,
    setTokenResult,
    tokenGenerating,
    isLoading,
  } = useConversation();
  const [loginLoading, setLoginLoading] = useState<boolean>(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClieint = useQueryClient();

  useEffect(() => {
    setLoginLoading(true);
    setTimeout(() => {
      const accessToken = getCookie('accessToken');
      getUsedCount(accessToken).then((data) => {
        data && setUseCount(data.userPromptNumber);
        queryClieint.invalidateQueries({
          queryKey: [QUERY_KEY.GET_USED_COUNT, accessToken],
        });
      });
      setTimeout(() => {
        setLoginLoading(false);
      }, 500);
    }, 200);
  }, [connected, status, isLoading]);

  const handleCount = useCallback(async () => {
    if (useCount === undefined || useCount >= 5) {
      setStatus('start');
      dispatch(
        SET_TOAST({
          type: 'strategy-fail',
          canClose: true,
          autoClose: {
            duration: 5000,
          },
        }),
      );
    } else {
      await updateUseCount();
      queryClieint.invalidateQueries({ queryKey: [QUERY_KEY.GET_USED_COUNT] });
      setStatus('processing');
    }
  }, [status, useCount, dispatch]);

  const start = useMemo(() => {
    if (status !== 'start') {
      return undefined;
    }
    return {
      name: 'start' as const,
      onClick: () => handleCount(),
    };
  }, [status, conversations, useCount]);

  const handleRestart = useCallback(async () => {
    if (useCount === undefined || useCount >= 5) {
      setStatus('end');
      dispatch(
        SET_TOAST({
          type: 'strategy-fail',
          canClose: true,
          autoClose: {
            duration: 5000,
          },
        }),
      );
    } else {
      await updateUseCount();
      queryClieint.invalidateQueries({
        queryKey: [QUERY_KEY.GET_USED_COUNT],
      });
      setLastMessage(null);
      setConversations([]);
      setInput('');
      setStatus('processing');
      setTokenResult(null);
    }
  }, [useCount, dispatch, conversations, lastMessage, status]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLoading, tokenGenerating]);

  return (
    <div className={cx('board-container')} ref={scrollRef}>
      {status !== 'processing' && loginLoading ? null : status !==
          'processing' &&
        (useCount === undefined || useCount >= 5) ? (
        <div className={cx('item-wrapper')}>
          <ConversationCard
            type={'assistant'}
            content={promptAgentExhausted}
            handler={{
              name: 'strategy',
              onClick: () => router.push('/strategy'),
            }}
          />
        </div>
      ) : (
        <div className={cx('item-wrapper')}>
          <ConversationCard
            type={'assistant'}
            content={promptAgentIntroduce}
            handler={start}
          />
        </div>
      )}
      {conversations.map((conversation: ConversationType, index: number) => {
        return (
          <div key={index} className={cx('item-wrapper')}>
            <ConversationCard
              type={conversation.type}
              content={conversation.content}
              handler={conversation.handler}
            />
          </div>
        );
      })}
      {lastMessage && (
        <div className={cx('item-wrapper')}>
          <ConversationCard
            type={lastMessage.type}
            content={lastMessage.content}
            handler={lastMessage.handler}
          />
        </div>
      )}
      {tokenGenerating && (
        <div className={cx('result-wrapper')}>
          <LoadingChatCard />
        </div>
      )}
      {tokenResult && status === 'end' && (
        <div className={cx('result-wrapper')}>
          <TokenResultCard
            coins={tokenResult.coins}
            handler={{
              name: 'restart',
              onClick: async () => handleRestart(),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ConversationBoard;

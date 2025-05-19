import React from 'react';
import styles from '@/components/container/step/firstContainer/FirstContainer.module.scss';
import classNames from 'classnames/bind';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import AIVolution from '@/public/assets/aivolution.png';
import ConversationProvider from '@/states/partial/conversation/ConversationProvider';
import ConversationBoard from '@/components/common/board/conversationBoard';
import ConversationInput from '@/components/common/input/conversationInput';
import UseCountBadge from '@/components/common/badge/useCountBadge';
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '@/states/global/slice/modal';

const cx = classNames.bind(styles);

const FirstContainer = () => {
  const { connected, connecting } = useWallet();
  const dispatch = useDispatch();
  return (
    <div className={cx('step-container')}>
      <div className={cx('step-inner')}>
        <div className={cx('aivolution-wrapper')}>
          <Image
            src={AIVolution}
            alt="AIVolution"
            fill
            quality={100}
            priority
            className={cx('aivolution-image')}
          />
        </div>
        <div className={cx('text-wrapper')}>
          <h1 className={cx('main-title')}>Ask Agent Anything</h1>
          <div className={cx('desc-wrapper')}>
            <p className={cx('text-desc')}>
              AI refines user-input strategies and recommends tokens,
              personalizing the trading experience.{' '}
            </p>
            <p className={cx('text-desc')}>
              Prompt your strategy to get the latest recommendations from our AI
              agent.{' '}
            </p>
          </div>
        </div>
        <div className={cx('connect-button-container')}>
          {connected ? (
            <UseCountBadge />
          ) : (
            <button
              className={cx('connect-button')}
              onClick={() => {
                dispatch(SET_MODAL({ key: 'wallet-modal' }));
              }}
            >
              CONNECT WALLET
            </button>
          )}
        </div>
        {connected && (
          <ConversationProvider>
            <div className={cx('board-wrapper')}>
              <ConversationBoard />
            </div>
            <div className={cx('input-wrapper')}>
              <ConversationInput />
            </div>
          </ConversationProvider>
        )}
      </div>
    </div>
  );
};

export default FirstContainer;

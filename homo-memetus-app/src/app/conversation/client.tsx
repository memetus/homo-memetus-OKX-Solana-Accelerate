'use client';
import styles from '@/styles/pages/ConversationClient.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import AIVolution from '@/public/assets/aivolution.png';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';
import ConversationBoard from '@/components/common/board/conversationBoard';
import ConversationInput from '@/components/common/input/conversationInput';
import ConversationProvider from '@/states/partial/conversation/ConversationProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectButton from '@/components/common/button/connectButton';

const cx = classNames.bind(styles);

const ConversationClient = () => {
  const { isCopied, textCopy } = useCopy();
  const { connected, connecting } = useWallet();

  return (
    <div className={cx('client-container')}>
      <div className={cx('client-inner')}>
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
          <h1 className={cx('main-title')}>HOMO MEMETUS</h1>
          <div className={cx('main-desc-wrapper')}>
            <p className={cx('main-desc')}>
              Your AI agent evolving to profit from your strategy.
            </p>
            <p className={cx('main-desc')}>
              Don’t ape in $ai16z, $SPORE, $BERA, etc.
            </p>
            <p className={cx('main-desc')}>Ape in your $STRATEGY.</p>
            <div className={cx('ca-wrapper')}>
              <p className={cx('ca-text')}>CA: </p>
              <p
                className={cx('ca-address')}
                onClick={() => {
                  textCopy('7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o');
                }}
              >
                7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o
                <button
                  className={cx('copy-button')}
                  onClick={() =>
                    textCopy('7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o')
                  }
                >
                  {isCopied ? (
                    <CopyCheckIcon
                      viewBox="0 0 24 24"
                      className={cx('copy-button-icon')}
                    />
                  ) : (
                    <CopyIcon
                      viewBox="0 0 24 24"
                      className={cx('copy-button-icon')}
                    />
                  )}
                </button>
              </p>
            </div>
          </div>
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
      {!connected && !connecting && (
        <div className={cx('connect-button-wrapper')}>
          <ConnectButton />
        </div>
      )}
    </div>
  );
};

export default ConversationClient;

'use client';
import styles from '@/styles/pages/HomeClient.module.scss';
import classNames from 'classnames/bind';
import AgentGenInput from '@/components/common/input/agentGenInput';
import AgentGenButton from '@/components/common/button/agentGenButton';
import dynamic from 'next/dynamic';
import InputProvider from '@/states/partial/input/InputProvider';
import SocketProvider from '@/states/partial/socket/SocketProvider';
import Image from 'next/image';
import AIVolution from '@/public/assets/aivolution.png';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';

const DynamicStrategyListTable = dynamic(
  () => import('@/components/common/table/strategyListTable'),
);

const cx = classNames.bind(styles);

const StrategyClient = () => {
  const { isCopied, textCopy } = useCopy();

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
        <InputProvider>
          <form className={cx('form-wrapper')}>
            <AgentGenInput />
            <AgentGenButton />
          </form>
        </InputProvider>
        <div className={cx('table-wrapper')}>
          <SocketProvider socketType="strategy">
            <DynamicStrategyListTable />
          </SocketProvider>
        </div>
      </div>
    </div>
  );
};

export default StrategyClient;

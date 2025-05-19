'use client';
import styles from '@/styles/pages/HomeClient.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import AIVolution from '@/public/assets/aivolution.png';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

const DynamicAgentListTable = dynamic(
  () => import('@/components/common/table/agentListTable'),
  { ssr: false },
);

const DynamicModal = dynamic(
  () => import('@/components/common/modal/buildingPublicModal'),
  { ssr: false },
);

const HomeClient = () => {
  const router = useRouter();
  const [state, setState] = useState<number>(2);
  const setStep = useCallback(
    (step: number) => {
      if (step === 1) {
        router.push(`/conversation`);
      } else if (step === 2) {
        router.push(`/building-in-public`);
      } else {
        router.push(`/`);
      }
    },
    [state],
  );
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
          <h1 className={cx('main-title')}>Best VIRTual Practice Dashboard</h1>
          <div className={cx('desc-wrapper')}>
            <p className={cx('text-desc')}>
              Your AI agent-led funds are evolving to tokenize your strategy.
            </p>
            <p className={cx('text-desc')}>
              Envisioning meme coin ETF infrastructure.
            </p>
            <p className={cx('text-desc')}>
              A virtual trading dashboard is here based on top strategies.
            </p>
            <p className={cx('text-desc')}>
              AI agents invest according to these strategies, providing daily
              token investment suggestions based on top-performing virtual
              funds.
            </p>
          </div>
        </div>
        <div className={cx('table-wrapper')}>
          <DynamicAgentListTable />
        </div>
      </div>
      <DynamicModal params={{}} step={state} setStep={setStep} />
    </div>
  );
};

export default HomeClient;

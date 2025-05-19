import React from 'react';
import styles from '@/components/common/card/realTradingCard/RealTradingCard.module.scss';
import classNames from 'classnames/bind';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

const RealTradingCard = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/real-trading');
  };

  return (
    <div className={cx('card-container')}>
      <div className={cx('card-title-wrapper')}>
        <span className={cx('card-title')}>REAL TRADING AGENTS ARE HERE</span>
      </div>
      <div className={cx('card-desc-wrapper')}>
        <span className={cx('card-desc')}>
          Witness how our top virtual agents are earning onchain.
        </span>
      </div>
      <button
        className={cx('card-button')}
        aria-label="to-real-trading"
        onClick={handleClick}
      >
        <span className={cx('card-button-text')}>Visit Real Trading</span>
      </button>
    </div>
  );
};

export default RealTradingCard;

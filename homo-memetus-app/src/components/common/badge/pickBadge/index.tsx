import React, { useMemo } from 'react';
import styles from '@/components/common/badge/pickBadge/PickBadge.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  pick: string;
  pnl: number;
};

const PickBadge = ({ pick, pnl }: Props) => {
  const hasDollar = useMemo(() => {
    return pick.startsWith('$');
  }, [pick]);

  const isEarning = useMemo(() => {
    return pnl > 0;
  }, [pnl]);

  const shortenPick = useMemo(() => {
    return pick.length > 10 ? `${pick.slice(0, 10)}...` : pick;
  }, [pick]);

  return (
    <div className={cx('badge')}>
      <span className={cx('badge-pick-text')}>
        {hasDollar ? shortenPick : `$${shortenPick}`}
      </span>
      <span
        className={cx('badge-pnl-text', {
          earning: isEarning,
          losing: !isEarning,
        })}
      >
        {isEarning ? `+${pnl}` : `-${Math.abs(pnl)}`}%
      </span>
    </div>
  );
};

export default PickBadge;

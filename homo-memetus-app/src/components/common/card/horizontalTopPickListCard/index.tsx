import React, { useCallback, useMemo } from 'react';
import styles from '@/components/common/card/horizontalTopPickListCard/HorizontalTopPickCard.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  symbol: string;
  pnl: number;
  name: string;
};

const HorizontalTopPickListCard = ({ symbol, pnl, name }: Props) => {
  const hasDollar = useMemo(() => {
    return symbol.startsWith('$');
  }, [symbol]);

  const isEarning = useMemo(() => {
    return pnl >= 0;
  }, [pnl]);

  const shortenText = useCallback((text: string) => {
    if (text.length > 12) {
      return `${text.slice(0, 12)}...`;
    }
    return text;
  }, []);

  return (
    <div className={cx('card-container')}>
      <div className={cx('image-wrapper')}></div>
      <span className={cx('symbol-text')}>
        {hasDollar ? `${shortenText(symbol)}` : `$${shortenText(symbol)}`}
      </span>
      <span
        className={cx('pnl-text', {
          earning: isEarning,
          losing: !isEarning,
        })}
      >
        {isEarning ? '+' : '-'}
        {pnl}%
      </span>
      <div className={cx('name-wrapper')}>
        <span className={cx('text')}>by</span>
        <span className={cx('name-text')}>{shortenText(name)}</span>
      </div>
    </div>
  );
};

export default HorizontalTopPickListCard;

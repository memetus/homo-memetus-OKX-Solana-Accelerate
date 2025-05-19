import React, { useMemo } from 'react';
import styles from '@/components/common/card/topPickListCard/TopPickListCard.module.scss';
import classNames from 'classnames/bind';
import { AgentTopPickType } from '@/shared/types/data/agent.type';
import { getShortenAddr } from '@/shared/utils/format';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';
import Link from 'next/link';

const cx = classNames.bind(styles);

type Props = AgentTopPickType;

const TopPickListCard = (props: Props) => {
  const { isCopied, textCopy } = useCopy();

  const hasDollar = useMemo(() => {
    return props.token.startsWith('$');
  }, [props.token]);

  const isEarning = useMemo(() => {
    return props.totalPnL > 0;
  }, [props.totalPnL]);

  return (
    <div className={cx('card')}>
      <div className={cx('card-header')}>
        <div className={cx('card-title-wrapper')}>
          <span className={cx('card-title')}>
            {hasDollar
              ? props.token.toUpperCase()
              : `$${props.token.toUpperCase()}`}
          </span>
          <span className={cx('card-address')}>
            {getShortenAddr(props.address)}
            <button
              className={cx('copy-button')}
              onClick={() => textCopy(props.address)}
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
          </span>
        </div>
        <div className={cx('card-pnl-wrapper')}>
          <span
            className={cx('card-pnl', {
              earning: isEarning,
              losing: !isEarning,
            })}
          >
            {props.totalPnL}%
          </span>
          <span className={cx('card-label')}>Total PnL</span>
        </div>
      </div>
      <div className={cx('card-text-wrapper')}>
        <span className={cx('card-text')}>
          &quot;
          {props.strategyPrompt}
          &quot;
        </span>
      </div>
      <div className={cx('card-footer')}>
        <span className={cx('card-footer-label')}>by</span>
        <Link
          href={`/agent/${props.fundId}`}
          target="_blank"
          className={cx('card-fund-text')}
        >
          {props.fundName}
        </Link>
      </div>
    </div>
  );
};

export default TopPickListCard;

import React, { useCallback } from 'react';
import styles from '@/components/common/badge/buttonBadge/ButtonBadge.module.scss';
import classNames from 'classnames/bind';
import TwitterIcon from '@/public/icon/twitter-icon.svg';
import TelegramIcon from '@/public/icon/telegram-icon.svg';
import DexscreenerIcon from '@/public/icon/dexscreener-icon.svg';
import Link from 'next/link';

const cx = classNames.bind(styles);

type Props = {
  type: string;
  url: string;
};

const ButtonBadge = ({ type, url }: Props) => {
  const getIcon = useCallback(() => {
    if (type === 'twitter') {
      return <TwitterIcon viewBox="0 0 30 18" className={cx('icon')} />;
    } else if (type === 'telegram') {
      return <TelegramIcon viewBox="0 0 24 24" className={cx('tg-icon')} />;
    } else if (type === 'dexscreener') {
      return <DexscreenerIcon viewBox="0 0 30 30" className={cx('icon')} />;
    }
  }, [type]);
  return (
    <div className={cx('badge-wrapper')}>
      <Link href={url} className={cx('badge-button')} target="_blank">
        {getIcon()}
      </Link>
    </div>
  );
};

export default ButtonBadge;

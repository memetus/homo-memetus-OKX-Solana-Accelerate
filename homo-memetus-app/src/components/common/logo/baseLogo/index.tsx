import React from 'react';
import styles from '@/components/common/logo/baseLogo/BaseLogo.module.scss';
import classNames from 'classnames/bind';
import Link from 'next/link';

const cx = classNames.bind(styles);

const BaseLogo = () => {
  return (
    <Link href={'/'} className={cx('logo-container')}>
      <span className={cx('logo-text')}>HOMO MEMETUS</span>
    </Link>
  );
};

export default BaseLogo;

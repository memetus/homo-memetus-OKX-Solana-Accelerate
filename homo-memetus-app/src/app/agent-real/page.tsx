import React from 'react';
import styles from '@/styles/pages/RealTradingPage.module.scss';
import classNames from 'classnames/bind';
import RealTradingClient from './../real-trading/client';

const cx = classNames.bind(styles);

const RealTradingPage = () => {
  return (
    <div className={cx('page-container')}>
      <RealTradingClient />
    </div>
  );
};

export default RealTradingPage;

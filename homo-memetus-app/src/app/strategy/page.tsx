import React from 'react';
import styles from '@/styles/pages/StrategyPage.module.scss';
import classNames from 'classnames/bind';
import StrategyClient from '@/app/strategy/client';
import { getMetadata } from '@/shared/lib/metadata';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: 'Homo Memetus | Strategy',
    description: 'Homo Memetus generate strategy.',
  });
};

const StrategyPage = () => {
  return (
    <main className={cx('page-container')}>
      <StrategyClient />
    </main>
  );
};

export default StrategyPage;

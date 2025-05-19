import React from 'react';
import styles from '@/styles/pages/RouterPage.module.scss';
import { getMetadata } from '@/shared/lib/metadata';
import classNames from 'classnames/bind';
import SecondContainer from '@/components/container/step/secondContainer';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: 'HOMO MEMETUS | Virtual Dashboard',
  });
};

const VirtualDashboard = () => {
  return (
    <main className={cx('page-container')}>
      <SecondContainer />
    </main>
  );
};

export default VirtualDashboard;

import React from 'react';
import styles from '@/styles/pages/RouterPage.module.scss';
import classNames from 'classnames/bind';
import RouterClient from '@/app/building-in-public/client';
import { getMetadata } from '@/shared/lib/metadata';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: 'HOMO MEMETUS | Building in Public',
  });
};

const RouterPage = () => {
  return (
    <main className={cx('page-container')}>
      <RouterClient />
    </main>
  );
};

export default RouterPage;

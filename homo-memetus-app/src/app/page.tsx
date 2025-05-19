import React from 'react';
import HomeClient from '@/app/client';
import { getMetadata } from '@/shared/lib/metadata';
import styles from '@/styles/pages/HomePage.module.scss';
import classNames from 'classnames/bind';
import AgentTerminalClient from '@/app/agent-terminal/client';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: 'HOMO MEMETUS | Best Virtual Practice Dashboard',
  });
};

const HomePage = async () => {
  return (
    <main className={cx('page-container')}>
      {/* <HomeClient /> */}
      <AgentTerminalClient />
    </main>
  );
};

export default HomePage;

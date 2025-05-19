import React from 'react';
import styles from '@/styles/pages/TerminalPage.module.scss';
import classNames from 'classnames/bind';
import NetworkClient from '@/app/agent-terminal/client';
import { getMetadata } from '@/shared/lib/metadata';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: `HOMO MEMETUS | Agent Terminal`,
  });
};

const AgentTerminalPage = () => {
  return (
    <main className={cx('page-container')}>
      <NetworkClient />
    </main>
  );
};

export default AgentTerminalPage;

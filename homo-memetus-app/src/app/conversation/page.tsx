import React from 'react';
import ConversationClient from '@/app/conversation/client';
import { getMetadata } from '@/shared/lib/metadata';
import styles from '@/styles/pages/HomePage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({});
};

const ConversationPage = async () => {
  return (
    <main className={cx('page-container')}>
      <ConversationClient />
    </main>
  );
};

export default ConversationPage;

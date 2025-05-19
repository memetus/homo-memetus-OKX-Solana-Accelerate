import React from 'react';
import styles from '@/styles/pages/KeywordsPage.module.scss';
import classNames from 'classnames/bind';
import KeywordsClient from '@/app/keywords/client';

const cx = classNames.bind(styles);

const KeyowrdsPage = () => {
  return (
    <main className={cx('page-container')}>
      <KeywordsClient />
    </main>
  );
};

export default KeyowrdsPage;

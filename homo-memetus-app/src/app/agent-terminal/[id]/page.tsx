import React from 'react';
import styles from '@/styles/pages/NetworkDetailPage.module.scss';
import classNames from 'classnames/bind';
import NetworkDetailClient from '@/app/agent-terminal/[id]/client';
import { getMetadata } from '@/shared/lib/metadata';

const cx = classNames.bind(styles);

type MetadataProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const generateMetadata = async ({ searchParams }: MetadataProps) => {
  const name = searchParams.name || null;
  return getMetadata({
    title: name ? `HOMO MEMETUS | ${name}` : 'HOMO MEMETUS | Ternimal',
  });
};

const NetworkDetailPage = () => {
  return (
    <main className={cx('page-container')}>
      <NetworkDetailClient />
    </main>
  );
};

export default NetworkDetailPage;

import React from 'react';
import styles from '@/styles/pages/AgentRealDetailPage.module.scss';
import classNames from 'classnames/bind';
import AgentRealDetailClient from './client';
import { getMetadata } from '@/shared/lib/metadata';

const cx = classNames.bind(styles);

type MetadataProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const generateMetadata = async ({ searchParams }: MetadataProps) => {
  const name = searchParams.name || null;
  return getMetadata({
    title: name ? `HOMO MEMETUS | ${name}` : 'HOMO MEMETUS | Dashboard',
  });
};

type Props = {
  params: {
    id: string;
  };
};

const AgentRealDetailPage = ({ params }: Props) => {
  return (
    <div className={cx('page-container')}>
      <AgentRealDetailClient id={params.id} />
    </div>
  );
};

export default AgentRealDetailPage;

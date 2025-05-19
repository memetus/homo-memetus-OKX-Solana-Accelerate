import React from 'react';
import styles from '@/styles/pages/AgentDetailPage.module.scss';
import classNames from 'classnames/bind';
import AgentDetailClient from '@/app/agent/[id]/client';
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

const AgentDetailPage = ({ params }: Props) => {
  return (
    <div className={cx('page-container')}>
      <AgentDetailClient id={params.id} />
    </div>
  );
};

export default AgentDetailPage;

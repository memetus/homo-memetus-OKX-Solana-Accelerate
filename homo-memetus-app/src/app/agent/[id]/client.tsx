'use client';
import React from 'react';
import styles from '@/styles/pages/AgentDetailClient.module.scss';
import classNames from 'classnames/bind';
import ArrowLineLeftIcon from '@/public/icon/arrow-line-left-icon.svg';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getAgentMetadata, getAgentStat } from '@/shared/api/agent/api';
import {
  AgentMetadataType,
  AgentStatType,
} from '@/shared/types/data/agent.type';
import AgentStatTable from '@/components/common/table/agentStatTable';
import PortfolioContainer from '@/components/container/portfolioContainer';
import { thousandFormat } from '@/shared/utils/format';
import { useSelector } from 'react-redux';
import { RootState } from '@/states/global/store';
import { getModal } from '@/states/global/slice/modal';
import YapModal from '@/components/common/modal/yapModal';

const cx = classNames.bind(styles);

type Props = {
  id: string;
};

const AgentDetailClient = ({ id }: Props) => {
  const router = useRouter();
  const yapModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'yap-modal'),
  );
  const { data: metadata, isLoading: metadataLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_METADATA, id],
    queryFn: () => getAgentMetadata(id) as Promise<AgentMetadataType | null>,
  });

  const { data: stat, isLoading: statLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_STAT, id],
    queryFn: () => getAgentStat(id) as Promise<AgentStatType | null>,
  });

  return (
    <div className={cx('client-container')}>
      <div className={cx('page-head')}>
        <button
          onClick={() => router.back()}
          aria-label="back-button"
          className={cx('back-button')}
        >
          <ArrowLineLeftIcon viewBox="0 0 24 22" className={cx('icon')} />
        </button>
        <div className={cx('metadata-wrapper')}>
          <h1 className={cx('agent-title')}>{metadata?.name}</h1>
          <div className={cx('text-wrapper')}>
            <span className={cx('text-label')}>Strategy</span>
            <span className={cx('text-value')}>{metadata?.strategy}</span>
          </div>
          <div className={cx('text-wrapper')}>
            <span className={cx('text-label')}>Fund Amount</span>
            <span
              className={cx('text-value')}
            >{`$${thousandFormat(metadata?.fundAmount ?? 0)} virtual fund`}</span>
          </div>
        </div>
        <div className={cx('stat-wrapper')}>
          <span className={cx('text-label')}>Stats</span>
          {metadata && stat && (
            <AgentStatTable
              name={metadata?.name}
              fundId={metadata?.fundId}
              nav={stat?.nav}
              realizedProfit={stat?.realizedProfit}
              unrealizedProfit={stat?.unrealizedProfit}
              totalPnL={stat?.totalPnL}
              createdAt={metadata?.createdAt}
            />
          )}
        </div>
        <div className={cx('portfolio-wrapper')}>
          <PortfolioContainer id={id} name={metadata?.name} />
        </div>
      </div>
      {yapModal &&
        yapModal.key === 'yap-modal' &&
        'content' in yapModal.params && <YapModal params={yapModal.params} />}
    </div>
  );
};

export default AgentDetailClient;

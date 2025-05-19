'use client';
import React from 'react';
import styles from '@/styles/pages/AgentRealDetailClient.module.scss';
import classNames from 'classnames/bind';
import ArrowLineLeftIcon from '@/public/icon/arrow-line-left-icon.svg';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/states/global/store';
import { getModal } from '@/states/global/slice/modal';
import { useQuery } from '@tanstack/react-query';
import { getAgentMetadata, getAgentStat } from '@/shared/api/agent/api';
import { QUERY_KEY } from '@/shared/constants/api';
import {
  AgentMetadataType,
  AgentStatType,
} from '@/shared/types/data/agent.type';
import AgentStatTable from '@/components/common/table/agentStatTable';
import PortfolioContainer from '@/components/container/portfolioContainer';
import YapModal from '@/components/common/modal/yapModal';
import AgentGraph from '@/components/common/graph/agentGraph';
import HorizontalTopPickList from '@/components/container/horizontalTopPickList';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';
import Link from 'next/link';
import RealPortfolioContainer from '@/components/container/realPortfolioContainer';

const cx = classNames.bind(styles);

type Props = {
  id: string;
};

const AgentRealDetailClient = ({ id }: Props) => {
  const router = useRouter();
  const { isCopied, textCopy } = useCopy();
  const yapModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'yap-modal'),
  );
  const { data: metadata, isLoading: metadataLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_METADATA, id],
    queryFn: () =>
      getAgentMetadata(id) as Promise<
        (AgentMetadataType & { address: string }) | null
      >,
  });

  const { data: stat, isLoading: statLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_STAT, id],
    queryFn: () => getAgentStat(id) as Promise<AgentStatType | null>,
  });

  return (
    <div className={cx('client-container')}>
      <div className={cx('client-inner')}>
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
              {/* <span className={cx('text-label')}>TOP PICKS</span> */}
              <HorizontalTopPickList />
            </div>
            <div className={cx('text-wrapper')}>
              <span className={cx('text-label')}>Strategy</span>
              <span className={cx('text-value')}>{metadata?.strategy}</span>
            </div>
            <div className={cx('text-wrapper')}>
              <span className={cx('text-label')}>Fund Amount</span>
              <span className={cx('text-value')}>1 SOL real fund</span>
              {/* {`$${thousandFormat(metadata?.fundAmount ?? 0)} real fund`}</span> */}
            </div>
            <div className={cx('text-wrapper')}>
              <span className={cx('text-label')}>ACCOUNT</span>
              <div className={cx('address-wrapper')}>
                <span className={cx('address-text')}>
                  <Link
                    target="_blank"
                    href={`https://solscan.io/account/${metadata?.address}`}
                  >
                    {metadata?.address}
                  </Link>
                  <button
                    className={cx('copy-button')}
                    onClick={() => metadata && textCopy(metadata?.address)}
                  >
                    {isCopied ? (
                      <CopyCheckIcon
                        viewBox="0 0 24 24"
                        className={cx('copy-button-icon')}
                      />
                    ) : (
                      <CopyIcon
                        viewBox="0 0 24 24"
                        className={cx('copy-button-icon')}
                      />
                    )}
                  </button>
                </span>
              </div>
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
          <div className={cx('stat-wrapper')}>
            <span className={cx('text-label')}>PNL</span>
            <AgentGraph
              id={`${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`}
              state={'hour'}
            />
          </div>
          <div className={cx('portfolio-wrapper')}>
            <RealPortfolioContainer id={id} name={metadata?.name} />
          </div>
        </div>
      </div>
      {yapModal &&
        yapModal.key === 'yap-modal' &&
        'content' in yapModal.params && <YapModal params={yapModal.params} />}
    </div>
  );
};

export default AgentRealDetailClient;

'use client';
import React, { useState } from 'react';
import styles from '@/styles/pages/RealTradingClient.module.scss';
import classNames from 'classnames/bind';
import HorizontalTopPickList from '@/components/container/horizontalTopPickList';
import RealAgentInfoTable from '@/components/common/table/realAgentInfoTable';
import RealAgentCardContainer from '@/components/container/realAgentCardContainer';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import {
  getAgentActivity,
  getAgentMetadata,
  getAgentStat,
} from '@/shared/api/agent/api';
import {
  AgentMetadataType,
  AgentStatType,
} from '@/shared/types/data/agent.type';
import AgentGraph from '@/components/common/graph/agentGraph';
import { PortfolioUIType } from '@/shared/types/ui/portfolio';
import { AgentActivityListType } from '@/shared/types/data/portfolio';
import AgentActivityListTable from '@/components/common/table/agentActivityListTable';
import { RootState } from '@/states/global/store';
import { useSelector } from 'react-redux';
import { getModal } from '@/states/global/slice/modal';
import YapModal from '@/components/common/modal/yapModal';
import AgentActivityContainer from '@/components/container/agentActivityContainer';

const cx = classNames.bind(styles);

const RealTradingClient = () => {
  const [state, setState] = useState<'hour' | 'day'>('hour');
  const [status, setStatus] = useState<PortfolioUIType>({
    state: 'activity',
    page: 1,
    pageSize: 10,
  });
  const yapModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'yap-modal'),
  );
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: [
      QUERY_KEY.GET_AGENT_PORTFOLIO_ACTIVITY,
      `${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`,
      status.page,
    ],
    queryFn: () =>
      getAgentActivity(
        `${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`,
        status.page,
      ) as Promise<AgentActivityListType>,
    staleTime: 5000,
  });
  const { data: stat, isLoading: statLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_STAT],
    queryFn: () =>
      getAgentStat(
        `${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`,
      ) as Promise<AgentStatType | null>,
  });

  const { data: metadata, isLoading: metadataLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_METADATA],
    queryFn: () =>
      getAgentMetadata(
        `${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`,
      ) as Promise<AgentMetadataType | null>,
  });

  return (
    <div className={cx('client-container')}>
      <div className={cx('client-inner')}>
        <div className={cx('text-wrapper')}>
          <h1 className={cx('main-title')}>REAL TRADING AGENTS ARE HERE</h1>
          <div className={cx('main-desc-wrapper')}>
            <p className={cx('main-desc')}>
              The first AI trading agent-led 1 $SOL challenge!
            </p>
            <p className={cx('main-desc')}>
              Witness how our top virtual agents are earning onchain.
            </p>
          </div>
        </div>
        <div className={cx('toppicks-wrapper')}>
          <HorizontalTopPickList />
        </div>
        <div className={cx('realagent-wrapper')}>
          <h3 className={cx('list-title')}>AGENTS</h3>
          {metadata && stat && (
            <RealAgentInfoTable
              name={metadata?.name}
              nav={stat?.nav}
              realizedProfit={stat?.realizedProfit}
              unrealizedProfit={stat?.unrealizedProfit}
              totalPnL={stat?.totalPnL}
            />
          )}
          <div className={cx('container-wrapper')}>
            {metadata && (
              <RealAgentCardContainer
                name={metadata?.name}
                id={`${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`}
                strategy={metadata?.strategy}
              />
            )}
          </div>
          <div className={cx('graph-wrapper')}>
            <div className={cx('graph-header')}>
              <div className={cx('title-wrapper')}>
                <h3 className={cx('list-title')}>TVL</h3>
              </div>
              <div className={cx('button-wrapper')}>
                <button
                  onClick={() => setState('hour')}
                  className={cx('day-wrapper', { active: state === 'hour' })}
                >
                  <span className={cx('day-text')}>1h</span>
                </button>
                {/* <button
                  onClick={() => setState('day')}
                  className={cx('day-wrapper', { active: state === 'day' })}
                >
                  <span className={cx('day-text')}>1d</span>
                </button> */}
              </div>
            </div>
            <AgentGraph
              id={`${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`}
              state={state}
            />
          </div>
          <div className={cx('activity-wrapper')}>
            {/* <h3 className={cx('list-title')}>ACTIVITY</h3>
            <AgentActivityListTable
              name={metadata?.name}
              data={activityData}
              loading={activityLoading}
            /> */}
            <AgentActivityContainer
              id={`${process.env.NEXT_PUBLIC_REAL_AGENT_ID}`}
            />
          </div>
        </div>
      </div>
      {yapModal &&
        yapModal.key === 'yap-modal' &&
        'content' in yapModal.params && <YapModal params={yapModal.params} />}
    </div>
  );
};

export default RealTradingClient;

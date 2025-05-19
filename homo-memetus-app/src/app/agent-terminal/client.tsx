'use client';
import React, { Suspense, useCallback, useState } from 'react';
import styles from '@/styles/pages/TerminalClient.module.scss';
import classNames from 'classnames/bind';
import dynamic from 'next/dynamic';
import NetworkProvider from '@/states/partial/network/NetworkProvider';
import { useQuery } from '@tanstack/react-query';
import { AgentGraphType } from '@/shared/types/data/agent.type';
import { QUERY_KEY } from '@/shared/constants/api';
import { getAgentBubbleDashboard } from '@/shared/api/agent/api';
import { convertAgentGraphToGraphData } from '@/shared/lib/graph';

const DynamicComponent = dynamic(
  () => import('@/components/container/bubbleMap/agentBubbleMap'),
  { ssr: false },
);

const cx = classNames.bind(styles);

const AgentTerminalClient = () => {
  const [state, setState] = useState<number>(3);
  const { data: bubble } = useQuery<AgentGraphType[]>({
    queryKey: [QUERY_KEY.GET_AGENT_BUBBLE_DASHBOARD],
    queryFn: () => getAgentBubbleDashboard(),
  });

  if (bubble) {
    const data = convertAgentGraphToGraphData(bubble);

    return (
      <NetworkProvider nodes={data.nodes} links={data.links}>
        <div className={cx('client-container')}>
          <Suspense>{<DynamicComponent data={data} activated />}</Suspense>
        </div>
      </NetworkProvider>
    );
  }
  return null;
};

export default AgentTerminalClient;

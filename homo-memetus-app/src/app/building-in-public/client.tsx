'use client';
import React, { Suspense, useCallback, useState } from 'react';
import styles from '@/styles/pages/RouterClient.module.scss';
import classNames from 'classnames/bind';
import BuildingPublicModal from '@/components/common/modal/buildingPublicModal';
import FirstContainer from '@/components/container/step/firstContainer';
import SecondContainer from '@/components/container/step/secondContainer';
import dynamic from 'next/dynamic';
import NetworkProvider from '@/states/partial/network/NetworkProvider';
import { useQuery } from '@tanstack/react-query';
import { AgentGraphType } from '@/shared/types/data/agent.type';
import { QUERY_KEY } from '@/shared/constants/api';
import { getAgentBubbleDashboard } from '@/shared/api/agent/api';
import { convertAgentGraphToGraphData } from '@/shared/lib/graph';
import { usePathname, useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

const DynamicModal = dynamic(
  () => import('@/components/common/modal/buildingPublicModal'),
  { ssr: false },
);

const DynamicComponent = dynamic(
  () => import('@/components/container/bubbleMap/agentBubbleMap'),
  { ssr: false },
);

const RouterClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<number>(3);
  const { data: bubble } = useQuery<AgentGraphType[]>({
    queryKey: [QUERY_KEY.GET_AGENT_BUBBLE_DASHBOARD],
    queryFn: () => getAgentBubbleDashboard(),
  });

  const setStep = useCallback(
    (step: number) => {
      if (step === 1) {
        router.push(`/conversation`);
      } else if (step === 2) {
        router.push(`/virtual-dashboard`);
      } else if (step === 3) {
        router.push(`/agent-terminal`);
      }
    },
    [state],
  );

  if (bubble) {
    const data = convertAgentGraphToGraphData(bubble);

    return (
      <NetworkProvider nodes={data.nodes} links={data.links}>
        <div className={cx('client-container')}>
          <DynamicModal params={{}} step={state} setStep={setStep} />
          <Suspense>
            {<DynamicComponent data={data} activated={false} />}
          </Suspense>
        </div>
      </NetworkProvider>
    );
  }

  return null;
};

export default RouterClient;

import React, {
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from '@/components/container/agentContainer/agentCardListContainer/AgentCardListContainer.module.scss';
import classNames from 'classnames/bind';
import AgentListCard from '@/components/common/card/agentListCard';
import {
  AgentDashboardResponse,
  AgentDashboardType,
} from '@/shared/types/data/agent.type';
import { getAgentDashboard } from '@/shared/api/agent/api';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';

const cx = classNames.bind(styles);

type Props = {
  onFocus: (node: NodeObject<NodeObject>) => void;
};

type Ref = {
  ref: MutableRefObject<ForceGraphMethods>;
};

const AgentCardListContainer = forwardRef<Ref, Props>(
  function AgentCardListContainerRef({ onFocus }: Props, ref) {
    const [isLast, setIsLast] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<number>(1);
    const [agentList, setAgentList] = useState<AgentDashboardType[]>([]);
    const [active, setActive] = useState<string | undefined>(undefined);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    const fetchAgents = useCallback(async () => {
      if (loading || isLast) return;

      try {
        setLoading(true);
        const response = await getAgentDashboard({
          page: pagination,
          pageSize: 20,
        });
        if (response instanceof Error) return;
        const { results } = response as AgentDashboardResponse;

        setAgentList((prev) => {
          const existingIds = new Set(prev.map((item) => item.fundId));
          const unique = results.filter(
            (item) => !existingIds.has(item.fundId),
          );
          return [...prev, ...unique];
        });

        if (results.length < 20) {
          setIsLast(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, [pagination, loading, isLast]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && !isLast) {
            setPagination((prev) => prev + 1);
          }
        },
        {
          root: null,
          threshold: 0.1,
        },
      );

      if (observerTargetRef.current) {
        observer.observe(observerTargetRef.current);
      }

      return () => observer.disconnect();
    }, [loading, isLast]);

    useEffect(() => {
      fetchAgents();
    }, [pagination]);

    return (
      <div className={cx('list-container')} id="container">
        {agentList?.map((agent, index) => {
          return (
            <AgentListCard
              key={index}
              ref={ref}
              onFocus={onFocus}
              index={index + 1}
              id={agent.fundId.toString()}
              name={agent.name}
              symbol={agent.name.toUpperCase()}
              description={agent.strategyPrompt}
              assetsValue={agent.nav}
              realizedPnl={agent.realizedProfit}
              unrealizedPnl={agent.unrealizedProfit}
              totalPnl={agent.totalPnL}
              imageUrl={agent.imageUrl}
              survived={agent.survived}
              active={active === agent.fundId.toString()}
              setActive={setActive}
              realTrading={agent.realTrading}
            />
          );
        })}
        <div id="observer-block" ref={observerTargetRef} />
      </div>
    );
  },
);

export default AgentCardListContainer;

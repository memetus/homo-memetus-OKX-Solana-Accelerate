import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/container/agentContainer/topPickCardListContainer/TopPickCardListContainer.module.scss';
import classNames from 'classnames/bind';
import TopPickListCard from '@/components/common/card/topPickListCard';
import {
  AgentTopPickResponse,
  AgentTopPickType,
} from '@/shared/types/data/agent.type';
import { getAgentTopPicks } from '@/shared/api/agent/api';

const cx = classNames.bind(styles);

const TopPickCardListContainer = () => {
  const [isLast, setIsLast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<number>(1);
  const [topPickList, setTopPickList] = useState<AgentTopPickType[]>([]);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const fetchAgents = useCallback(async () => {
    if (loading || isLast) return;

    try {
      setLoading(true);
      const response = await getAgentTopPicks({
        page: pagination,
        pageSize: 20,
      });
      if (response instanceof Error) return;
      const { results } = response as AgentTopPickResponse;

      setTopPickList((prev) => {
        const existingIds = new Set(prev.map((item) => item.fundId));
        const unique = results.filter((item) => !existingIds.has(item.fundId));
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
    fetchAgents();
  }, [pagination]);

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

  return (
    <div className={cx('list-container')} id="container">
      {topPickList.map((pick: AgentTopPickType, index: number) => {
        return <TopPickListCard key={index} {...pick} />;
      })}
      <div id="observer-block" ref={observerTargetRef} />
    </div>
  );
};

export default TopPickCardListContainer;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import BaseModal from '@/components/base/modal/baseModal';
import AgentListCard from '../../card/agentListCard';
import { getAgentDashboard } from '@/shared/api/agent/api';
import {
  AgentDashboardResponse,
  AgentDashboardType,
} from '@/shared/types/data/agent.type';
import { IoClose } from 'react-icons/io5';
import useModalCtrl from '@/shared/hooks/useModalCtrl';
import styles from './AgentBarModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const AgentBarModal = () => {
  const [pagination, setPagination] = useState(1);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agentList, setAgentList] = useState<AgentDashboardType[]>([]);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const { handleCloseModal } = useModalCtrl();
  const [anim, setAnim] = useState(true);
  const [active, setActive] = useState<string | undefined>(undefined);

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
    <BaseModal>
      <div className={cx('modal', { show: anim, hide: !anim })}>
        <div className={cx('modal-title-wrapper')}>
          <h3 className={cx('modal-title')}>TOP AGENTS</h3>
          <button
            className={cx('modal-close-button')}
            aria-label="close-bar-modal"
            onClick={() => {
              setAnim(false);
              handleCloseModal('agent-bar-modal', 1000);
            }}
          >
            <IoClose size={22} className={cx('modal-close-button-icon')} />
          </button>
        </div>

        <div className={cx('list-container')}>
          {agentList.map((agent, index) => (
            <AgentListCard
              key={agent.fundId}
              index={index + 1}
              id={agent.fundId.toString()}
              name={agent.name}
              symbol={agent.name.toUpperCase()}
              description={agent.strategyPrompt}
              assetsValue={agent.nav}
              realizedPnl={agent.realizedProfit}
              unrealizedPnl={agent.unrealizedProfit}
              totalPnl={agent.totalPnL}
              survived={agent.survived}
              imageUrl={agent.imageUrl}
              active={active === agent.fundId.toString()}
              setActive={setActive}
              realTrading={agent.realTrading}
            />
          ))}
          <div
            ref={observerTargetRef}
            style={{
              height: '20px',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default AgentBarModal;

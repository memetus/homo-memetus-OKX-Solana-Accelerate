import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/common/modal/topPicksModal/TopPicksModal.module.scss';
import classNames from 'classnames/bind';
import {
  AgentTopPickResponse,
  AgentTopPickType,
} from '@/shared/types/data/agent.type';
import { getAgentTopPicks } from '@/shared/api/agent/api';
import TopPickListCard from '../../card/topPickListCard';
import { IoClose } from 'react-icons/io5';
import useModalCtrl from '@/shared/hooks/useModalCtrl';
import BaseModal from '@/components/base/modal/baseModal';

const cx = classNames.bind(styles);

const TopPicksModal = () => {
  const [pagination, setPagination] = useState(1);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topPickList, setTopPickList] = useState<AgentTopPickType[]>([]);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const { handleCloseModal } = useModalCtrl();
  const [anim, setAnim] = useState(true);

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
    <BaseModal>
      <div className={cx('modal', { show: anim, hide: !anim })}>
        <div className={cx('modal-title-wrapper')}>
          <h3 className={cx('modal-title')}>TOP PICKS</h3>
          <button
            className={cx('modal-close-button')}
            onClick={() => {
              setAnim(false);
              handleCloseModal('top-picks-modal', 1000);
            }}
          >
            <IoClose size={22} className={cx('modal-close-button-icon')} />
          </button>
        </div>
        <div className={cx('list-container')} id="container">
          {topPickList.map((pick: AgentTopPickType, index: number) => {
            return <TopPickListCard key={index} {...pick} />;
          })}
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

export default TopPicksModal;

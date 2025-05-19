import React from 'react';
import styles from '@/components/container/horizontalTopPickList/HorizontalTopPickList.module.scss';
import classNames from 'classnames/bind';
import { useQuery } from '@tanstack/react-query';
import { getRealAgentTopPicks } from '@/shared/api/agent/api';
import HorizontalTopPickListCard from '@/components/common/card/horizontalTopPickListCard';
import { AgentTopPickType } from '@/shared/types/data/agent.type';

const cx = classNames.bind(styles);

const HorizontalTopPickList = () => {
  const { data } = useQuery({
    queryKey: ['top-picks'],
    queryFn: () => {
      return getRealAgentTopPicks({
        page: 1,
        pageSize: 100,
      });
    },
  });

  if (!data) return null;

  return (
    <div className={cx('list-container')}>
      <h3 className={cx('list-title')}>TOP PICKS</h3>
      <div className={cx('list-card-wrapper')}>
        {data?.results?.map((item: AgentTopPickType, index: number) => {
          return (
            <HorizontalTopPickListCard
              key={index}
              symbol={item.token}
              pnl={item.totalPnL}
              name={item.fundName}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalTopPickList;

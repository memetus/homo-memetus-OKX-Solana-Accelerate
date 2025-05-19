import React from 'react';
import styles from '@/components/container/horizontalAgentToppickList/HorizontalAgentToppicList.module.scss';
import classNames from 'classnames/bind';
import { getAgentTopPicks } from '@/shared/api/agent/api';
import { useQuery } from '@tanstack/react-query';
import { AgentTopPickType } from '@/shared/types/data/agent.type';
import HorizontalTopPickListCard from '@/components/common/card/horizontalTopPickListCard';

const cx = classNames.bind(styles);

type Prosp = {
  id: string;
};

const HorizontalAgentToppickList = ({ id }: Prosp) => {
  const { data } = useQuery({
    queryKey: ['top-picks', id],
    queryFn: () => {
      return getAgentTopPicks({
        page: 1,
        pageSize: 100,
      });
    },
  });

  if (!data) return null;

  return (
    <div className={cx('list-container')}>
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

export default HorizontalAgentToppickList;

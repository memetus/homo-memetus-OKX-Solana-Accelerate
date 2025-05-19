import React from 'react';
import styles from '@/components/container/realAgentCardContainer/RealAgentCardContainer.module.scss';
import classNames from 'classnames/bind';
import RealAgentCard from '@/components/common/card/realAgentCard';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  id: string;
  strategy: string;
};

const RealAgentCardContainer = ({ name, id, strategy }: Props) => {
  return (
    <div className={cx('card-list-container')}>
      <RealAgentCard disabled={false} name={name} id={id} strategy={strategy} />
      <RealAgentCard
        disabled={true}
        name="-"
        id="agent1"
        strategy="Comming Soon..."
      />
      <RealAgentCard
        disabled={true}
        name="-"
        id="agent1"
        strategy="Comming Soon..."
      />
    </div>
  );
};

export default RealAgentCardContainer;

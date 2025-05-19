import React from 'react';
import styles from '@/components/common/card/realAgentCard/RealAgentCard.module.scss';
import classNames from 'classnames/bind';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  id: string;
  strategy: string;
  disabled?: boolean;
};

const RealAgentCard = ({ name, id, strategy, disabled = false }: Props) => {
  const router = useRouter();

  return (
    <button
      disabled={disabled}
      onClick={() => router.push(`/agent-real/${id}`)}
      className={cx('card-container')}
    >
      <span className={cx('card-title')}>{name}</span>
      <div className={cx('card-text-wrapper')}>
        <span className={cx('card-text')}>{strategy}</span>
      </div>
    </button>
  );
};

export default RealAgentCard;

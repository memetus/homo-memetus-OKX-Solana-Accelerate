import React, { useMemo } from 'react';
import styles from '@/components/common/card/agentCard/AgentCard.module.scss';
import classNames from 'classnames/bind';
import { thousandFormat } from '@/shared/utils/format';
import PickBadge from '../../badge/pickBadge';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getAgentById } from '@/shared/api/agent/api';
import { AgentDashboardDetailType } from '@/shared/types/data/agent.type';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const cx = classNames.bind(styles);

type Props = {
  id: string;
};

const AgentCard = ({ id }: Props) => {
  const router = useRouter();
  const { data } = useQuery<AgentDashboardDetailType>({
    queryKey: [QUERY_KEY.GET_AGENT_DATA_BY_ID, id],
    queryFn: () => getAgentById(id),
  });

  const isEarning = useMemo(() => {
    if (data?.totalPnL) {
      return data.totalPnL > 0;
    }
    return false;
  }, [data, id]);

  return (
    <div className={cx('card')}>
      <div className={cx('card-profile-wrapper')}>
        <div className={cx('card-info-wrapper')}>
          <div className={cx('card-image')}>
            {data && (
              <Image
                src={data?.imageUrl}
                alt="agent-image"
                priority
                fill
                className={cx('image')}
              />
            )}
          </div>
          <div className={cx('card-text-wrapper')}>
            <span className={cx('card-symbol-text')}>
              ${data?.name.toUpperCase()}
            </span>
            <span className={cx('card-name-text')}>{data?.name}</span>
          </div>
        </div>
        <div className={cx('card-gen-wrapper')}>
          <span className={cx('card-gen-text')}>GEN {data?.generation}</span>
        </div>
      </div>
      <div className={cx('card-desc-wrapper')}>
        <span className={cx('card-desc-text')}>{data?.strategyPrompt}</span>
      </div>
      <div className={cx('card-stat-wrapper')}>
        <span className={cx('card-stat-text')}>STATS</span>
        <div className={cx('card-stat-value-wrapper')}>
          <span className={cx('card-stat-label-text')}>Net Asset Value</span>
          <span className={cx('card-stat-value-text')}>
            {data && `$${thousandFormat(data.nav)}`}
          </span>
        </div>
        <div className={cx('card-stat-value-wrapper')}>
          <span className={cx('card-stat-label-text')}>Realized PnL</span>
          <span className={cx('card-stat-value-text')}>
            {data && data.realizedProfit > 0
              ? `+$${thousandFormat(data.realizedProfit)}`
              : `-$${thousandFormat(Math.abs(data?.realizedProfit ?? 0))}`}
          </span>
        </div>
        <div className={cx('card-stat-value-wrapper')}>
          <span className={cx('card-stat-label-text')}>Unrealized PnL</span>
          <span className={cx('card-stat-value-text')}>
            {data && data.unrealizedProfit > 0
              ? `+$${thousandFormat(data.unrealizedProfit)}`
              : `-$${thousandFormat(Math.abs(data?.unrealizedProfit ?? 0))}`}
          </span>
        </div>
        <div className={cx('card-stat-value-wrapper')}>
          <span className={cx('card-stat-label-text')}>Total PnL</span>
          <span
            className={cx('card-stat-result-value-text', {
              earning: isEarning,
              losing: !isEarning,
            })}
          >
            {data?.totalPnL}%
          </span>
        </div>
      </div>
      <div className={cx('card-pick-wrapper')}>
        <span className={cx('card-stat-text')}>TOP PICKS</span>
        <div className={cx('badge-list-wrapper')}>
          {data?.topPics.map((pick, index) => {
            return (
              <PickBadge key={index} pick={pick.token} pnl={pick.totalPnL} />
            );
          })}
        </div>
      </div>
      <button
        className={cx('card-button')}
        aria-label="agent-detail-button"
        onClick={() => {
          if (data?.realTrading) {
            router.push(`/agent-real/${id}`);
          } else {
            router.push(`/agent/${id}`);
          }
        }}
      >
        <span className={cx('card-button-text')}>View Detail</span>
      </button>
    </div>
  );
};

export default AgentCard;

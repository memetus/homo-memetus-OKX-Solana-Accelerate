import React, { useMemo, useState } from 'react';
import styles from '@/components/container/realPortfolioContainer/RealPortfolioContainer.module.scss';
import classNames from 'classnames/bind';
import { PortfolioUIType } from '@/shared/types/ui/portfolio';
import {
  AgentActivityType,
  AgentHoldingsListType,
  HoldingsTokenQueryType,
} from '@/shared/types/data/portfolio';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getAgentActivity, getAgentHolding } from '@/shared/api/agent/api';
import ArrowLeftIcon from '@/public/icon/arrow-left-icon.svg';
import ArrowRightIcon from '@/public/icon/arrow-right-icon.svg';
import DoubleArrowLeftIcon from '@/public/icon/double-arrow-left-icon.svg';
import DoubleArrowRightIcon from '@/public/icon/double-arrow-right-icon.svg';
import RealAgentActivityListTable from '@/components/common/table/realAgentActivityListTable';
import AgentHoldingListTable from '@/components/common/table/agentHoldingListTable';

const cx = classNames.bind(styles);

type Props = {
  id: string;
  name?: string;
};

type ActivityListType =
  | {
      results: (AgentActivityType & {
        address: string;
        txHash: string;
      })[];
      totalCount: number;
    }
  | undefined;

const RealPortfolioContainer = ({ id, name }: Props) => {
  const [status, setStatus] = useState<PortfolioUIType>({
    state: 'activity',
    page: 1,
    pageSize: 10,
  });
  const [holdingsQuery, setHoldingsQuery] = useState<{
    sort: HoldingsTokenQueryType;
    sortOrder: 'asc' | 'desc';
  }>({
    sort: 'totalPnL',
    sortOrder: 'desc',
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_PORTFOLIO_ACTIVITY, id, status.page],
    queryFn: () =>
      getAgentActivity(id, status.page) as Promise<ActivityListType>,
    staleTime: 5000,
  });

  const { data: holdingsData, isLoading: holdingsLoading } = useQuery({
    queryKey: [
      QUERY_KEY.GET_AGENT_PORTFOLIO_HOLDINGS,
      id,
      status.page,
      holdingsQuery.sort,
      holdingsQuery.sortOrder,
    ],
    queryFn: () =>
      getAgentHolding(
        id,
        status.page,
        holdingsQuery.sort,
        holdingsQuery.sortOrder,
      ) as Promise<AgentHoldingsListType>,
    staleTime: 5000,
  });

  const firstDisable = useMemo(() => {
    return status.page <= 1;
  }, [status.page, status.state]);

  const prevDisable = useMemo(() => {
    return status.page <= 1;
  }, [status.page, status.state]);

  const nextDisable = useMemo(() => {
    if (status.state === 'activity') {
      return activityData?.totalCount
        ? Math.ceil(activityData.totalCount / 10) <= status.page
        : true;
    } else {
      return holdingsData?.totalCount
        ? Math.ceil(holdingsData.totalCount / 10) <= status.page
        : true;
    }
  }, [status.state, status.page, activityData, holdingsData]);

  return (
    <div className={cx('table-container')}>
      <span className={cx('table-label-title')}>Portfolio</span>
      <div className={cx('table-label-container')}>
        <div className={cx('table-nav-container')}>
          <span className={cx('table-label-text')}>Portfolio</span>
          <div className={cx('table-nav')}>
            <button
              className={cx('table-nav-button', {
                active: status.state === 'activity',
              })}
              onClick={() =>
                setStatus({ state: 'activity', page: 1, pageSize: 10 })
              }
            >
              Activity
            </button>
            <button
              className={cx('table-nav-button', {
                active: status.state === 'holdings',
              })}
              onClick={() =>
                setStatus({ state: 'holdings', page: 1, pageSize: 10 })
              }
            >
              Holdings
            </button>
          </div>
        </div>
        <div className={cx('table-ctrl-container')}>
          <button
            disabled={firstDisable}
            aria-label="move-to-first"
            className={cx('button')}
            onClick={() => setStatus({ ...status, page: 1 })}
          >
            <DoubleArrowLeftIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <button
            disabled={prevDisable}
            aria-label="move-to-prev"
            className={cx('button')}
            onClick={() => setStatus({ ...status, page: status.page - 1 })}
          >
            <ArrowLeftIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <span className={cx('page-text')}>Page {status.page}</span>
          <button
            disabled={nextDisable}
            aria-label="move-to-next"
            className={cx('button')}
            onClick={() => {
              setStatus({ ...status, page: status.page + 1 });
            }}
          >
            <ArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <button
            disabled={nextDisable}
            aria-label="move-to-last"
            className={cx('button')}
            onClick={() => {
              if (status.state === 'activity') {
                setStatus({
                  ...status,
                  page: activityData?.totalCount
                    ? Math.ceil(activityData.totalCount / 10)
                    : 1,
                });
              } else {
                setStatus({
                  ...status,
                  page: holdingsData?.totalCount
                    ? Math.ceil(holdingsData.totalCount / 10)
                    : 1,
                });
              }
            }}
          >
            <DoubleArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
        </div>
      </div>
      {status.state === 'activity' ? (
        <RealAgentActivityListTable
          name={name}
          data={activityData}
          loading={activityLoading}
        />
      ) : (
        <AgentHoldingListTable
          data={holdingsData}
          loading={holdingsLoading}
          setStatus={setStatus}
          setQuery={setHoldingsQuery}
        />
      )}
      <div className={cx('table-ctrl-wrapper')}>
        <div className={cx('table-ctrl-container')}>
          <button
            disabled={firstDisable}
            aria-label="move-to-first"
            className={cx('button')}
            onClick={() => setStatus({ ...status, page: 1 })}
          >
            <DoubleArrowLeftIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <button
            disabled={prevDisable}
            aria-label="move-to-prev"
            className={cx('button')}
            onClick={() => setStatus({ ...status, page: status.page - 1 })}
          >
            <ArrowLeftIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <span className={cx('page-text')}>Page {status.page}</span>
          <button
            disabled={nextDisable}
            aria-label="move-to-next"
            className={cx('button')}
            onClick={() => {
              setStatus({ ...status, page: status.page + 1 });
            }}
          >
            <ArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
          <button
            disabled={nextDisable}
            aria-label="move-to-last"
            className={cx('button')}
            onClick={() => {
              if (status.state === 'activity') {
                setStatus({
                  ...status,
                  page: activityData?.totalCount
                    ? Math.ceil(activityData.totalCount / 10)
                    : 1,
                });
              } else {
                setStatus({
                  ...status,
                  page: holdingsData?.totalCount
                    ? Math.ceil(holdingsData.totalCount / 10)
                    : 1,
                });
              }
            }}
          >
            <DoubleArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealPortfolioContainer;

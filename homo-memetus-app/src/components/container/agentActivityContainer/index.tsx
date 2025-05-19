import React, { useMemo, useState } from 'react';
import styles from '@/components/container/agentActivityContainer/AgentActivityContainer.module.scss';
import classNames from 'classnames/bind';
import { getAgentActivity } from '@/shared/api/agent/api';
import { AgentActivityListType } from '@/shared/types/data/portfolio';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import ArrowLeftIcon from '@/public/icon/arrow-left-icon.svg';
import ArrowRightIcon from '@/public/icon/arrow-right-icon.svg';
import DoubleArrowLeftIcon from '@/public/icon/double-arrow-left-icon.svg';
import DoubleArrowRightIcon from '@/public/icon/double-arrow-right-icon.svg';
import AgentActivityListTable from '@/components/common/table/agentActivityListTable';

const cx = classNames.bind(styles);

type Props = {
  id: string;
  name?: string;
};

const AgentActivityContainer = ({ id, name }: Props) => {
  const [status, setStatus] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 10,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_AGENT_PORTFOLIO_ACTIVITY, id, status.page],
    queryFn: () =>
      getAgentActivity(id, status.page) as Promise<AgentActivityListType>,
    staleTime: 5000,
  });

  const firstDisable = useMemo(() => {
    return status.page <= 1;
  }, [status.page]);

  const prevDisable = useMemo(() => {
    return status.page <= 1;
  }, [status.page]);

  const nextDisable = useMemo(() => {
    return activityData?.totalCount
      ? Math.ceil(activityData.totalCount / 10) <= status.page
      : true;
  }, [activityData]);

  return (
    <div className={cx('table-container')}>
      <span className={cx('table-label-title')}>Portfolio</span>
      <div className={cx('table-label-container')}>
        <div className={cx('table-nav-container')}>
          <span className={cx('table-label-text')}>Activity</span>
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
              setStatus({
                ...status,
                page: activityData?.totalCount
                  ? Math.ceil(activityData.totalCount / 10)
                  : 1,
              });
            }}
          >
            <DoubleArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
        </div>
      </div>
      <AgentActivityListTable
        name={name}
        data={activityData}
        loading={activityLoading}
      />
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
              setStatus({
                ...status,
                page: activityData?.totalCount
                  ? Math.ceil(activityData.totalCount / 10)
                  : 1,
              });
            }}
          >
            <DoubleArrowRightIcon viewBox="0 0 24 25" className={cx('icon')} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentActivityContainer;

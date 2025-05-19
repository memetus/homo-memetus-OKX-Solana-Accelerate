import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/components/common/table/strategyListTable/StrategyListTable.module.scss';
import classNames from 'classnames/bind';
import { fetchStrategy } from '@/shared/api/strategy/api';
import { StrategyCreateResponse } from '@/shared/types/data/api.type';
import { getShortenAddr } from '@/shared/utils/format';
import { useSocket } from '@/states/partial/socket/SocketContext';

const cx = classNames.bind(styles);

const StrategyListTable = () => {
  const [isLast, setIsLast] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<number>(1);
  const [strategyList, setStrategyList] = useState<StrategyCreateResponse[]>(
    [],
  );
  const [fetchedList, setFetchedList] = useState<StrategyCreateResponse[]>([]);
  const { isConnected, socketClient } = useSocket();
  const fetchStrategyList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchStrategy({ page: pagination, limit: 10 });
      if (response instanceof Error) return;
      const { strategies, total } = response;
      setTotal(total);
      if ((strategies && strategies instanceof Array) || !isLast) {
        if (strategies.length <= 10) {
          setFetchedList([...strategies]);
          if (strategies.length < 10) {
            setIsLast(true);
          }
        } else {
          setIsLast(true);
        }
      } else {
        setIsLast(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination, isLast, loading, strategyList, total]);

  useEffect(() => {
    socketClient?.on('strategy', (strategy: StrategyCreateResponse) => {
      setStrategyList([strategy, ...strategyList]);
      setTotal(total + 1);
    });
  }, [socketClient, isConnected, strategyList, total]);

  const onIntersection: IntersectionObserverCallback = (
    entries: IntersectionObserverEntry[],
  ) => {
    const target = entries[0];
    if (target.isIntersecting && !isLast && !loading) {
      setPagination((prev) => prev + 1);
      setStrategyList([...strategyList, ...fetchedList]);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersection, {
      root: document.querySelector('#container'),
      threshold: 0,
      rootMargin: '0px',
    });

    const observerTarget = document.querySelector('#observer-block');
    if (observerTarget) observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
  }, [strategyList, fetchedList, loading, isLast]);

  useEffect(() => {
    fetchStrategyList();
  }, [pagination]);

  return (
    <div className={cx('table-container')}>
      <div className={cx('table-label-wrapper')}>
        <span className={cx('table-label')}>Strategies</span>
        <span className={cx('total-list-item')}>total {total}</span>
      </div>
      <table className={cx('table')}>
        <tbody className={cx('table-cell')} id="container">
          {[...strategyList, ...fetchedList].map(
            (item: StrategyCreateResponse, index: number) => {
              const last = index === strategyList.length - 1 && isLast;
              return (
                <tr
                  className={cx('table-cell-item', { last })}
                  key={`${item._id}-${index}-${pagination}`}
                >
                  <td className={cx('address')}>
                    {getShortenAddr(item.userWallet)}
                  </td>
                  <td className={cx('text')}>{item.contents}</td>
                </tr>
              );
            },
          )}
          <tr
            key={'observer-block'}
            id="observer-block"
            style={{ height: '1px' }}
          />
        </tbody>
      </table>
    </div>
  );
};

export default StrategyListTable;

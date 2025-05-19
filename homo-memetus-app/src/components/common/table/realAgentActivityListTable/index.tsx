import React from 'react';
import styles from '@/components/common/table/realAgentActivityListTable/RealAgentActivityListTable.module.scss';
import classNames from 'classnames/bind';
import {
  AgentActivityListType,
  AgentActivityType,
} from '@/shared/types/data/portfolio';
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '@/states/global/slice/modal';
import { fetchRelatedTimeDay, fetchUpdatedTime } from '@/shared/utils/date';
import { formatSignPrice } from '@/shared/utils/price';
import { thousandFormat } from '@/shared/utils/format';
import Link from 'next/link';

const cx = classNames.bind(styles);

type Props = {
  name?: string;
  data:
    | {
        results: (AgentActivityType & {
          address: string;
          txHash: string;
        })[];
        totalCount: number;
      }
    | undefined;
  loading: boolean;
};

const RealAgentActivityListTable = ({ name, data, loading }: Props) => {
  const dispatch = useDispatch();

  return (
    <div className={cx('table-container')}>
      <div className={cx('table-wrapper')}>
        <table className={cx('table')}>
          <thead className={cx('table-header')}>
            <tr className={cx('tr')}>
              <th className={cx('th', { type: true })}>Type</th>
              <th className={cx('th', { token: true })}>Token</th>
              <th className={cx('th', { signature: true })}>Signature</th>
              <th className={cx('th', { usd: true })}>Total USD</th>
              <th className={cx('th', { profit: true })}>Profit</th>
              <th className={cx('th', { yaps: true })}>Rationale</th>
              <th className={cx('th', { age: true })}>Age</th>
            </tr>
          </thead>
          <tbody className={cx('table-body')}>
            {loading ? (
              <tr className={cx('tr-loading')}>
                <td className={cx('td')}>Loading..</td>
              </tr>
            ) : (
              data?.results?.map(
                (
                  item: AgentActivityType & {
                    address: string;
                    txHash: string;
                  },
                  index: number,
                ) => {
                  const profit =
                    item.profit === null
                      ? '-'
                      : formatSignPrice(item.profit.toFixed(2));
                  const total =
                    item.total === null
                      ? '-'
                      : item.type === 'buy'
                        ? `+$${thousandFormat(item.total)}`
                        : `-$${thousandFormat(item.total)}`;

                  const isEarned = item.profit !== null && item.profit > 0;
                  return (
                    <tr
                      key={`${item.token}-{${index}`}
                      className={cx('tr', { isLast: index === 10 })}
                    >
                      <td className={cx('td', { type: true })}>
                        <button
                          className={cx('type', {
                            buy: item.type === 'buy',
                            sell: item.type === 'sell',
                          })}
                        >
                          {item.type === 'buy' ? 'Buy' : 'Sell'}
                        </button>
                      </td>
                      <td className={cx('td', { token: true })}>
                        <Link
                          target="_blank"
                          href={`https://solscan.io/account/${item.address}`}
                        >
                          {item.token}
                        </Link>
                      </td>
                      <td className={cx('td', { signature: true })}>
                        <Link
                          target="_blank"
                          href={`https://solscan.io/tx/${item.txHash}`}
                        >
                          {item.txHash.slice(0, 10)}...
                        </Link>
                      </td>
                      <td
                        className={cx('td', {
                          isPlus: item.type === 'buy',
                          isMinus: item.type === 'sell',
                          usd: true,
                        })}
                      >
                        {total}
                      </td>
                      <td
                        className={cx('td', {
                          isPlus: isEarned && profit !== '-',
                          isMinus: !isEarned && profit !== '-',
                          profit: true,
                        })}
                      >
                        {profit}
                      </td>
                      <td className={cx('td', { yaps: true })}>
                        {item.yaps.slice(0, 80)}...
                        <button
                          className={cx('more-button')}
                          onClick={() =>
                            dispatch(
                              SET_MODAL({
                                key: 'yap-modal',
                                params: {
                                  name: name,
                                  content: item.yaps,
                                  symbol: item.token,
                                },
                              }),
                            )
                          }
                        >
                          <span className={cx('more-button-text')}>more</span>
                        </button>
                      </td>
                      <td className={cx('td', { age: true })}>
                        {fetchRelatedTimeDay(item.createdAt, true) === 'now'
                          ? 'now'
                          : `${fetchRelatedTimeDay(item.createdAt, true)} ago`}
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
      <div className={cx('update-time-wrapper')}>
        <span className={cx('update-time-text')}>
          updates every 1 hour / last updated
          {` ${fetchUpdatedTime(new Date().toString())}`}
        </span>
        <span className={cx('total-text')}>
          Total {data?.totalCount ?? '-'}
          <span className={cx('name-text')}>transactions</span>
        </span>
      </div>
    </div>
  );
};

export default RealAgentActivityListTable;

import React, { Dispatch, SetStateAction } from 'react';
import styles from '@/components/common/table/agentHoldingListTable/AgentHoldingListTable.module.scss';
import classNames from 'classnames/bind';
import {
  AgentHoldingsListType,
  AgentHoldingsType,
  HoldingsTokenQueryType,
} from '@/shared/types/data/portfolio';
import {
  formatPrice,
  formatSignPercentage,
  formatSignPrice,
} from '@/shared/utils/price';
import SortTableButton from '@/components/common/button/sortTableButton';
import { PortfolioUIType } from '@/shared/types/ui/portfolio';
import { fetchUpdatedTime } from '@/shared/utils/date';
import AddressCopyButton from '@/components/common/button/addressCopyButton';

const cx = classNames.bind(styles);

type Props = {
  data: AgentHoldingsListType | undefined;
  loading: boolean;
  setStatus: Dispatch<SetStateAction<PortfolioUIType>>;
  setQuery: Dispatch<{
    sort: HoldingsTokenQueryType;
    sortOrder: 'asc' | 'desc';
  }>;
};

const AgentHoldingListTable = ({
  data,
  loading,
  setStatus,
  setQuery,
}: Props) => {
  return (
    <div className={cx('table-container')}>
      <div className={cx('table-wrapper')}>
        <table className={cx('table')}>
          <thead className={cx('table-header')}>
            <tr className={cx('tr')}>
              <th className={cx('th')}>Token</th>
              <th className={cx('th')}>
                <SortTableButton
                  text="Realized"
                  asc={() => {
                    setQuery({ sort: 'realized', sortOrder: 'asc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                  desc={() => {
                    setQuery({ sort: 'realized', sortOrder: 'desc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                />
              </th>
              <th className={cx('th')}>
                <SortTableButton
                  text="Unrealized"
                  asc={() => {
                    setQuery({ sort: 'unrealized', sortOrder: 'asc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                  desc={() => {
                    setQuery({ sort: 'unrealized', sortOrder: 'desc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                />
              </th>
              <th className={cx('th')}>
                <SortTableButton
                  text="Total PnL"
                  asc={() => {
                    setQuery({ sort: 'totalPnL', sortOrder: 'asc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                  desc={() => {
                    setStatus((status) => {
                      setQuery({ sort: 'totalPnL', sortOrder: 'desc' });
                      return { ...status, page: 1 };
                    });
                  }}
                />
              </th>
              <th className={cx('th')}>
                <SortTableButton
                  text="NAV"
                  asc={() => {
                    setQuery({ sort: 'nav', sortOrder: 'asc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                  desc={() => {
                    setQuery({ sort: 'nav', sortOrder: 'desc' });
                    setStatus((status) => {
                      return { ...status, page: 1 };
                    });
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody className={cx('table-body')}>
            {loading ? (
              <tr className={cx('tr-loading')}>
                <td className={cx('td')}>Loading..</td>
              </tr>
            ) : (
              data?.results.map((item: AgentHoldingsType, index: number) => {
                return (
                  <tr key={`${item.token}-${index}`} className={cx('tr')}>
                    <td className={cx('td')}>
                      <AddressCopyButton
                        name={item.token}
                        address={item.address}
                      />
                    </td>
                    <td
                      className={cx('td', {
                        isPlus: item?.realizedProfit > 0,
                        isMinus: item?.realizedProfit < 0,
                      })}
                    >
                      {formatSignPrice(item.realizedProfit?.toFixed(2))}
                    </td>
                    <td
                      className={cx('td', {
                        isPlus: item?.unrealizedProfit > 0,
                        isMinus: item?.unrealizedProfit < 0,
                      })}
                    >
                      {formatSignPrice(item.unrealizedProfit?.toFixed(2))}
                    </td>
                    <td
                      className={cx('td', {
                        isPlus: item?.totalPnL > 0,
                        isMinus: item?.totalPnL < 0,
                      })}
                    >
                      {formatSignPercentage(item.totalPnL?.toFixed(2))}
                    </td>
                    <td className={cx('td')}>
                      ${formatPrice(item.nav?.toFixed(2))}
                    </td>
                  </tr>
                );
              })
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
          <span className={cx('name-text')}>items</span>
        </span>
      </div>
    </div>
  );
};

export default AgentHoldingListTable;

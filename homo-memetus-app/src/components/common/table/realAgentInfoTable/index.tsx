import React from 'react';
import styles from '@/components/common/table/realAgentInfoTable/RealAgentInfoTable.module.scss';
import classNames from 'classnames/bind';
import { formatSignPercentage, formatSignPrice } from '@/shared/utils/price';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  nav: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalPnL: number;
};

const RealAgentInfoTable = ({
  name,
  nav,
  realizedProfit,
  unrealizedProfit,
  totalPnL,
}: Props) => {
  return (
    <div className={cx('table-wrapper')}>
      <table className={cx('table')}>
        <thead className={cx('table-header')}>
          <tr className={cx('tr')}>
            <th className={cx('th')}>Agent</th>
            <th className={cx('th')}>NAV</th>
            <th className={cx('th')}>Realized</th>
            <th className={cx('th')}>Unrealized</th>
            <th className={cx('th')}>Total PnL</th>
          </tr>
        </thead>
        <tbody className={cx('table-body')}>
          <tr className={cx('tr')}>
            <td className={cx('td', 'name')}>{name}</td>
            <td className={cx('td')}>${nav}</td>
            <td
              className={cx('td', {
                isPlus: realizedProfit > 0,
                isMinus: realizedProfit < 0,
              })}
            >
              {formatSignPrice(realizedProfit?.toFixed(2))}
            </td>
            <td
              className={cx('td', {
                isPlus: unrealizedProfit > 0,
                isMinus: unrealizedProfit < 0,
              })}
            >
              {formatSignPrice(unrealizedProfit?.toFixed(2))}
            </td>
            <td
              className={cx('td', {
                isPlus: totalPnL > 0,
                isMinus: totalPnL < 0,
              })}
            >
              {formatSignPercentage(totalPnL?.toFixed(2))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RealAgentInfoTable;

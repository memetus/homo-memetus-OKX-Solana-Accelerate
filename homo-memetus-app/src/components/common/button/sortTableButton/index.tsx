import React from 'react';
import styles from '@/components/common/button/sortTableButton/SortTableButton.module.scss';
import classNames from 'classnames/bind';
import ArrowUpIcon from '@/public/icon/arrow-up-icon.svg';
import ArrowDownIcon from '@/public/icon/arrow-down-icon.svg';

const cx = classNames.bind(styles);

type Props = {
  asc: () => void;
  desc: () => void;
  text: string;
};

const SortTableButton = ({ asc, desc, text }: Props) => {
  return (
    <div className={cx('container')}>
      <div className={cx('text-container')}>
        <span className={cx('text')}>{text}</span>
      </div>
      <div className={cx('button-wrapper')}>
        <button aria-label="sort-asc" className={cx('button')} onClick={asc}>
          <ArrowUpIcon viewBox="0 0 11 7" className={cx('icon')} />
        </button>
        <button aria-label="desc" className={cx('button')} onClick={desc}>
          <ArrowDownIcon viewBox="0 0 11 7" className={cx('icon')} />
        </button>
      </div>
    </div>
  );
};

export default SortTableButton;

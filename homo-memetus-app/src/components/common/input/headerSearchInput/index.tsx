import React from 'react';
import styles from '@/components/common/input/headerSearchInput/HeaderSearchInput.module.scss';
import classNames from 'classnames/bind';
import SearchIcon from '@/public/icon/search-icon.svg';

const cx = classNames.bind(styles);

const HeaderSearchInput = () => {
  return (
    <div className={cx('header-search-input-container')}>
      <input
        type="text"
        className={cx('header-search-input')}
        placeholder="Token ticker / Contract address"
      />
      <button onClick={() => {}} className={cx('icon-container')}>
        <SearchIcon viewBox="0 0 24 24" className={cx('icon')} />
      </button>
    </div>
  );
};

export default HeaderSearchInput;

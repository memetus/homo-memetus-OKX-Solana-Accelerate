import React from 'react';
import styles from '@/components/container/agentContainer/searchCardListContainer/SearchCardContainer.module.scss';
import classNames from 'classnames/bind';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';
import TopPickListCard from '@/components/common/card/topPickListCard';
import { IoSearchOutline } from 'react-icons/io5';

const cx = classNames.bind(styles);

const SearchCardContainer = () => {
  const { searchResults, setSearchKeyword, setSearchResults, handleSearch } =
    useNetworkContext();

  const handleTokenOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setSearchResults([]);
    }
    const value = e.target.value;
    setSearchKeyword(value);
  };

  return (
    <div className={cx('list-container')}>
      <div className={cx('search-input-wrapper')}>
        <IoSearchOutline className={cx('input-icon')} size={16} />
        <input
          type="text"
          className={cx('search-input')}
          placeholder="Search symbol"
          onChange={(e) => handleTokenOnChange(e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>
      {searchResults.map((item, index) => {
        return <TopPickListCard key={index} {...item} />;
      })}
    </div>
  );
};

export default SearchCardContainer;

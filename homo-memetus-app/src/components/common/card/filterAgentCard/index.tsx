import React, { useState } from 'react';
import styles from '@/components/common/card/filterAgentCard/FilterAgentCard.module.scss';
import classNames from 'classnames/bind';
import { IoMdArrowDropleft } from 'react-icons/io';
import { IoMdArrowDropright } from 'react-icons/io';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';
import { IoSearchOutline } from 'react-icons/io5';
import validator from 'validator';

const cx = classNames.bind(styles);

export enum FilterState {
  TOKEN = 'token',
  GENERATION = 'generation',
  SURVIVED = 'survived',
  ELIMINATED = 'eliminated',
  EARNING = 'earning',
  LOSING = 'losing',
  CLEAN = 'clean',
}

const FilterAgentCard = () => {
  const [filterState, setFilterState] = useState<FilterState>(
    FilterState.CLEAN,
  );
  const [generation, setGeneration] = useState<string>('');
  const {
    highlightNodeIdList,
    nodeList,
    setHighlightNodeIdList,
    recentGeneration,
    handleSearch,
    setSearchKeyword,
    setSearchResults,
  } = useNetworkContext();

  const handleGenOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      validator.isNumeric(value) &&
      Number(value) >= 1 &&
      Number(value) <= recentGeneration
    ) {
      setGeneration(value);
      highlightNodeIdList.clear();
      nodeList.forEach((node) => {
        if (node.generation === Number(value)) {
          highlightNodeIdList.add(node.id);
        }
      });
      setHighlightNodeIdList(highlightNodeIdList);
    } else {
      setGeneration('');
      highlightNodeIdList.clear();
      setHighlightNodeIdList(highlightNodeIdList);
    }
  };

  const handleTokenOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setSearchResults([]);
    }
    const value = e.target.value;
    setSearchKeyword(value);
  };

  return (
    <div className={cx('card-container')}>
      <div className={cx('input-container')}>
        <span className={cx('input-label-text')}>Search Token</span>
        <div className={cx('input-wrapper')}>
          <IoSearchOutline className={cx('input-icon')} size={16} />
          <input
            type="text"
            aria-label="agent-search-input"
            className={cx('input')}
            placeholder="Search Token"
            onChange={(e) => handleTokenOnChange(e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button className={cx('input-button')} onClick={() => handleSearch()}>
            search
          </button>
        </div>
      </div>
      <div className={cx('filter-container')}>
        <div className={cx('filter-header')}>
          <span className={cx('filter-label-text')}>Filters</span>
          <button
            className={cx('clean-button', { reset: true })}
            aria-label="reset"
            onClick={() => {
              setFilterState(FilterState.CLEAN);
              setGeneration('');
              highlightNodeIdList.clear();
            }}
          >
            Clear
          </button>
          {/* <button
          className={cx('button', { apply: true })}
          aria-label="applicate"
        >
          Apply
        </button> */}
        </div>
        <div className={cx('gen-input-wrapper')}>
          <span className={cx('gen-input-label')}>Generation</span>
          <div className={cx('gen-ctrl-wrapper')}>
            <div className={cx('gen-input-ctrl-wrapper')}>
              <button
                className={cx('gen-input-ctrl-button')}
                aria-label="gen-ctrl-left-button"
                disabled={generation === String(1)}
                onClick={() => {
                  setFilterState(FilterState.GENERATION);
                  if (generation === '') {
                    setGeneration(String(recentGeneration));
                    highlightNodeIdList.clear();
                    nodeList.forEach((node) => {
                      if (node.generation === recentGeneration) {
                        highlightNodeIdList.add(node.id);
                      }
                    });
                    setHighlightNodeIdList(highlightNodeIdList);
                  } else {
                    const newGeneration = Number(generation) - 1;
                    setGeneration(String(newGeneration));
                    highlightNodeIdList.clear();
                    nodeList.forEach((node) => {
                      if (node.generation === newGeneration) {
                        highlightNodeIdList.add(node.id);
                      }
                    });
                    setHighlightNodeIdList(highlightNodeIdList);
                  }
                }}
              >
                <IoMdArrowDropleft
                  className={cx('gen-button-icon')}
                  size={20}
                />
              </button>
              <input
                type="text"
                className={cx('gen-ctrl-input')}
                onFocus={() => setFilterState(FilterState.GENERATION)}
                onChange={(e) => handleGenOnChange(e)}
                value={
                  filterState === FilterState.GENERATION ? generation : '-'
                }
              />
              <button
                className={cx('gen-input-ctrl-button')}
                aria-label="gen-ctrl-right-button"
                disabled={generation === String(recentGeneration)}
                onClick={() => {
                  setFilterState(FilterState.GENERATION);
                  if (generation === '') {
                    setGeneration(String(1));
                    highlightNodeIdList.clear();
                    nodeList.forEach((node) => {
                      if (node.generation === 1) {
                        highlightNodeIdList.add(node.id);
                      }
                    });
                    setHighlightNodeIdList(highlightNodeIdList);
                  } else {
                    const newGeneration = Number(generation) + 1;
                    setGeneration(String(newGeneration));
                    highlightNodeIdList.clear();
                    nodeList.forEach((node) => {
                      if (node.generation === newGeneration) {
                        highlightNodeIdList.add(node.id);
                      }
                    });
                    setHighlightNodeIdList(highlightNodeIdList);
                  }
                }}
              >
                <IoMdArrowDropright
                  className={cx('gen-button-icon')}
                  size={20}
                />
              </button>
            </div>
            <button
              className={cx('gen-clear-button')}
              aria-label="gen-clear-button"
              onClick={() => {
                setGeneration('');
                highlightNodeIdList.clear();
                setFilterState(FilterState.CLEAN);
              }}
            >
              All
            </button>
          </div>
        </div>
        <div className={cx('selection-wrapper')}>
          <span className={cx('selection-label')}>Survival</span>
          <div className={cx('selection-button-wrapper')}>
            <button
              className={cx('selection-button', {
                survived: true,
                active: filterState === FilterState.SURVIVED,
              })}
              aria-label="survived"
              onClick={() => {
                if (filterState !== FilterState.SURVIVED) {
                  highlightNodeIdList.clear();
                  nodeList.forEach((node) => {
                    if (node.survived) {
                      highlightNodeIdList.add(node.id);
                    }
                  });
                  setHighlightNodeIdList(highlightNodeIdList);
                  setFilterState(FilterState.SURVIVED);
                } else {
                  highlightNodeIdList.clear();
                  setFilterState(FilterState.CLEAN);
                }
              }}
            >
              Survived
            </button>
            <button
              className={cx('selection-button', {
                eliminated: true,
                active: filterState === FilterState.ELIMINATED,
              })}
              aria-label="eliminated"
              onClick={() => {
                if (filterState !== FilterState.ELIMINATED) {
                  highlightNodeIdList.clear();
                  nodeList.forEach((node) => {
                    if (!node.survived) {
                      highlightNodeIdList.add(node.id);
                    }
                  });
                  setHighlightNodeIdList(highlightNodeIdList);
                  setFilterState(FilterState.ELIMINATED);
                } else {
                  highlightNodeIdList.clear();
                  setFilterState(FilterState.CLEAN);
                }
              }}
            >
              Eliminated
            </button>
          </div>
        </div>
        <div className={cx('selection-wrapper')}>
          <span className={cx('selection-label')}>PnL</span>
          <div className={cx('selection-button-wrapper')}>
            <button
              className={cx('selection-button', {
                earning: true,
                active: filterState === FilterState.EARNING,
              })}
              aria-label="survived"
              onClick={() => {
                if (filterState !== FilterState.EARNING) {
                  highlightNodeIdList.clear();
                  nodeList.forEach((node) => {
                    if (node.pnl > 0) {
                      highlightNodeIdList.add(node.id);
                    }
                  });
                  setHighlightNodeIdList(highlightNodeIdList);
                  setFilterState(FilterState.EARNING);
                } else {
                  highlightNodeIdList.clear();
                  setFilterState(FilterState.CLEAN);
                }
              }}
            >
              Earning
            </button>
            <button
              className={cx('selection-button', {
                losing: true,
                active: filterState === FilterState.LOSING,
              })}
              aria-label="eliminated"
              onClick={() => {
                if (filterState !== FilterState.LOSING) {
                  highlightNodeIdList.clear();
                  nodeList.forEach((node) => {
                    if (node.pnl < 0) {
                      highlightNodeIdList.add(node.id);
                    }
                  });
                  setFilterState(FilterState.LOSING);
                  setHighlightNodeIdList(highlightNodeIdList);
                } else {
                  highlightNodeIdList.clear();
                  setFilterState(FilterState.CLEAN);
                }
              }}
            >
              Losing
            </button>
          </div>
        </div>
        {/* <div className={cx('selection-category-wrapper')}>
          <span className={cx('selection-category-label')}>Category</span>
          <div className={cx('selection-category-button-wrapper')}>
            <button
              className={cx('selection-category-button')}
              aria-label="kol-button"
            >
              KOL
            </button>
            <button
              className={cx('selection-category-button')}
              aria-label="trend-button"
            >
              Trend
            </button>
            <button
              className={cx('selection-category-button')}
              aria-label="category-buttonn"
            >
              Sector
            </button>
            <button
              className={cx('selection-category-button')}
              aria-label="market-button"
            >
              BTC
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default FilterAgentCard;

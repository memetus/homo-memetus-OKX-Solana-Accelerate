import React, { useRef, useState } from 'react';
import styles from '@/components/common/modal/filterAgentModal/FilterAgentModal.module.scss';
import classNames from 'classnames/bind';
import useModalCtrl from '@/shared/hooks/useModalCtrl';
import { useOnClick } from '@/shared/hooks/useOnClick';
import BaseModal from '@/components/base/modal/baseModal';
import { FilterState } from '../../card/filterAgentCard';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';
import validator from 'validator';
import { IoSearchOutline } from 'react-icons/io5';
import { IoMdArrowDropleft } from 'react-icons/io';
import { IoMdArrowDropright } from 'react-icons/io';

const cx = classNames.bind(styles);

const FilterAgentModal = () => {
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

  const modalRef = useRef<HTMLDivElement>(null);
  const { handleCloseModal } = useModalCtrl();

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

  useOnClick({
    ref: modalRef,
    handler: () => handleCloseModal('filter-agent-modal'),
    mouseEvent: 'click',
  });

  return (
    <BaseModal>
      <div className={cx('modal-wrapper')}>
        <div className={cx('modal')} ref={modalRef}>
          <div className={cx('modal-inner')}>
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
              </div>
            </div>
            <div className={cx('filter-container')}>
              <div className={cx('filter-header')}>
                <span className={cx('filter-label-text')}>Filters</span>
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
                        filterState === FilterState.GENERATION
                          ? generation
                          : '-'
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
            </div>
            <button
              className={cx('button')}
              onClick={() => handleCloseModal('filter-agent-modal')}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default FilterAgentModal;

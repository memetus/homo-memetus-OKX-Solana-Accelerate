import React, { forwardRef, MutableRefObject, useMemo } from 'react';
import styles from '@/components/common/card/agentListCard/AgentListCard.module.scss';
import classNames from 'classnames/bind';
import { RiArrowUpSLine } from 'react-icons/ri';
import { RiArrowDownSLine } from 'react-icons/ri';
import { thousandFormat } from '@/shared/utils/format';
import Image from 'next/image';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { MdOutlineCancel } from 'react-icons/md';
import StarIcon from '@/public/icon/real-agent-icon.svg';

const cx = classNames.bind(styles);

type Props = {
  index: number;
  id: string;
  name: string;
  symbol: string;
  description: string;
  assetsValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  imageUrl: string;
  active: boolean;
  survived: boolean;
  realTrading: boolean;
  setActive: (id: string | undefined) => void;
  onFocus?: (node: NodeObject<NodeObject>) => void;
};

type Ref = {
  ref?: MutableRefObject<ForceGraphMethods>;
};

const AgentListCard = forwardRef<Ref, Props>(function AgentListCardRef(
  props: Props,
  ref,
) {
  const {
    highlightNodeIdList,
    setHighlightNodeIdList,
    focusNode,
    nodeList,
    setFocusNodeId,
  } = useNetworkContext();
  const isEarning = useMemo(() => {
    return props.totalPnl > 0;
  }, [props.totalPnl]);

  return (
    <div className={cx('card')}>
      <button
        className={cx('card-button-wrapper')}
        onClick={() => {
          if (props.active) {
            highlightNodeIdList.clear();
            setHighlightNodeIdList(highlightNodeIdList);
          } else {
            const node = nodeList.find((node) => node.id === props.id);
            if (node) {
              props.onFocus && props?.onFocus(node);
              setFocusNodeId(node.id);
              if (focusNode && focusNode.current) {
                focusNode.current = node;
              }
            }
            highlightNodeIdList.clear();
            highlightNodeIdList.add(props.id);
            setHighlightNodeIdList(highlightNodeIdList);
          }
        }}
      >
        <div className={cx('info-wrapper')}>
          <span className={cx('info-rank-text')}>#{props.index}</span>
          <div className={cx('info-image')}>
            <Image
              src={props.imageUrl}
              alt="agent-image"
              priority
              fill
              className={cx('image')}
            />
            {props.realTrading && (
              <StarIcon className={cx('star-icon')} viewBox="0 0 20 20" />
            )}
            {!props.survived && (
              <MdOutlineCancel size={36} className={cx('x-icon')} />
            )}
          </div>
          <div className={cx('info-profile-wrapper')}>
            <span
              className={cx('info-symbol-text', {
                eliminated: !props.survived,
              })}
            >
              $
              {props.symbol.length > 12
                ? `${props.symbol.slice(0, 12)},,,`
                : props.symbol}
            </span>
            <span
              className={cx('info-name-text', { eliminated: !props.survived })}
            >
              {props.name}
            </span>
          </div>
        </div>
        <div className={cx('pnl-wrapper')}>
          <div className={cx('pnl-text-wrapper')}>
            <span
              className={cx('pnl-value-text', {
                earning: isEarning,
                losing: !isEarning,
              })}
            >
              {isEarning ? `+${props.totalPnl}` : props.totalPnl}%
            </span>
            <span className={cx('pnl-label-text')}>Total PnL</span>
          </div>
          <button
            className={cx('button')}
            aria-label="dropdown-button"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (props.active) {
                props.setActive(undefined);
                highlightNodeIdList.clear();
                setHighlightNodeIdList(highlightNodeIdList);
              } else {
                const node = nodeList.find((node) => node.id === props.id);
                if (node) {
                  props.onFocus && props?.onFocus(node);
                  setFocusNodeId(node.id);
                  if (focusNode && focusNode.current) {
                    focusNode.current = node;
                  }
                }
                props.setActive(props.id);
                highlightNodeIdList.clear();
                highlightNodeIdList.add(props.id);
                setHighlightNodeIdList(highlightNodeIdList);
              }
            }}
          >
            {props.active ? (
              <RiArrowUpSLine className={cx('button-icon')} />
            ) : (
              <RiArrowDownSLine className={cx('button-icon')} />
            )}
          </button>
        </div>
      </button>
      <div className={cx('card-menu-wrapper', { open: props.active })}>
        <div className={cx('desc-wrapper')}>
          <p className={cx('desc-text')}>{props.description}</p>
        </div>
        <div className={cx('stat-wrapper')}>
          <span className={cx('stat-text')}>STATS</span>
          <div className={cx('stat-value-wrapper')}>
            <span className={cx('stat-label-text')}>Net Asset Value</span>
            <span className={cx('stat-value-text')}>
              {props.assetsValue > 0 ? '+' : '-'}$
              {thousandFormat(props.assetsValue)}
            </span>
          </div>
          <div className={cx('stat-value-wrapper')}>
            <span className={cx('stat-label-text')}>Realized PnL</span>
            <span className={cx('stat-value-text')}>
              {props && props.realizedPnl > 0
                ? `+$${thousandFormat(props.realizedPnl)}`
                : `-$${thousandFormat(Math.abs(props?.realizedPnl ?? 0))}`}
            </span>
          </div>
          <div className={cx('stat-value-wrapper')}>
            <span className={cx('stat-label-text')}>Unrealized PnL</span>
            <span className={cx('stat-value-text')}>
              {props && props.unrealizedPnl > 0
                ? `+$${thousandFormat(props.unrealizedPnl)}`
                : `-$${thousandFormat(Math.abs(props?.unrealizedPnl ?? 0))}`}
            </span>
          </div>
          <div className={cx('stat-value-wrapper')}>
            <span className={cx('stat-label-text')}>Total PnL</span>
            <span
              className={cx('stat-result-value-text', {
                earning: isEarning,
                losing: !isEarning,
              })}
            >
              {isEarning ? `+${props.totalPnl}` : props.totalPnl}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AgentListCard;

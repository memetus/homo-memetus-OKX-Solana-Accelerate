import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from '@/components/container/bubbleMap/agentBubbleMap/AgentBubbleMap.module.scss';
import classNames from 'classnames/bind';
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';
import AgentCard from '@/components/common/card/agentCard';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';
import FilterAgentCard from '@/components/common/card/filterAgentCard';
import { Link, Node } from '@/shared/types/ui/graph';
import { FaMinus } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa6';
import { BiReset } from 'react-icons/bi';
import { getGraphNodeSize } from '@/shared/lib/graph';
import AgentSidebar from '@/components/container/sidebar/agentSidebar';
import { RxDoubleArrowRight } from 'react-icons/rx';
import { RxDoubleArrowLeft } from 'react-icons/rx';
import useWindow from '@/shared/hooks/useWindow';
import { FaSliders } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { getModal, SET_MODAL } from '@/states/global/slice/modal';
import { RootState } from '@/states/global/store';
import { useDispatch, useSelector } from 'react-redux';
import FilterAgentModal from '@/components/common/modal/filterAgentModal';
import { BsBarChart } from 'react-icons/bs';
import { TbCoinBitcoin } from 'react-icons/tb';
import AgentBarModal from '@/components/common/modal/agentBarModal';
import TopPicksModal from '@/components/common/modal/topPicksModal';
import * as d3 from 'd3-force';
import RealTradingCard from '@/components/common/card/realTradingCard';

const cx = classNames.bind(styles);

type Props = {
  activated?: boolean;
  data: {
    nodes: Node[];
    links: Link[];
    pnlMap: Map<string, number>;
    realMap: Map<string, boolean>;
  };
};

const AgentBubbleMap = ({ data, activated = false }: Props) => {
  const router = useRouter();
  const filterAgentModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'filter-agent-modal'),
  );

  const agentBarModal = useSelector((state: RootState) => {
    return getModal(state as RootState, 'agent-bar-modal');
  });
  const topPicksModal = useSelector((state: RootState) => {
    return getModal(state as RootState, 'top-picks-modal');
  });
  const dispatch = useDispatch();
  const {
    focusNode,
    focusNodeId,
    hoverNode,
    highlightLinkList,
    setHighlightLinkList,
    setFocusNodeId,
    highlightNodeIdList,
    setHighlightNodeIdList,
  } = useNetworkContext();
  const { isMobile, isTablet } = useWindow();
  const [open, setOpen] = useState<boolean>(true);
  const [isMount, setIsMount] = useState<boolean>(false);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const graphRef = useRef<ForceGraphMethods>();
  const updateHighlight = () => {
    setHighlightNodeIdList(highlightNodeIdList);
    setHighlightLinkList(highlightLinkList);
  };

  const handleClick = useCallback(
    (node: NodeObject<NodeObject>) => {
      if (node.id !== undefined && node.x && node.y) {
        const distance = 200;
        const distRatio =
          1 + distance / Math.hypot(node.x, node.y, node.z || 0);
        if (graphRef && graphRef.current) {
          graphRef.current.zoomToFit(300, 30, (n) => n.id === node.id);
          graphRef.current.centerAt(node.x, node.y, 1000);
          graphRef.current.zoom(distRatio, 1000);
        }
        if (focusNode) {
          setFocusNodeId(String(node.id));
          focusNode.current = node as Node;
        }
      }
    },
    [graphRef, focusNode, isMobile, isTablet],
  );

  const handleOverHighlight = useCallback(
    (
      node: NodeObject<NodeObject>,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      let pnl = data.pnlMap.get(String(node.id));
      let isReal = data.realMap.get(String(node.id));

      const label = node.name;
      const threshold = 100;
      const shouldShowLabel =
        getGraphNodeSize(node.pnl) * globalScale > threshold;
      const sizeFactor = getGraphNodeSize(node.pnl) || 1;
      const minFont = 6;
      const maxFont = 10;

      if (pnl !== undefined) {
        ctx.beginPath();
        ctx.arc(
          node.x ?? 0,
          node.y ?? 0,
          getGraphNodeSize(node.pnl) / 5,
          0,
          2 * Math.PI,
          false,
        );
        // #c7bd4b;
        if (isReal) {
          ctx.fillStyle = '#c7bd4b';
        } else {
          ctx.fillStyle = 'white';
        }
        ctx.fill();
      }

      if (hoverNodeId === String(node.id) && pnl !== undefined) {
        ctx.beginPath();
        ctx.arc(
          node.x ?? 0,
          node.y ?? 0,
          getGraphNodeSize(pnl) / 2.5,
          0,
          2 * Math.PI,
          false,
        );
        if (isReal) {
          ctx.fillStyle = 'rgba(199, 189, 75, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }
        ctx.fill();

        ctx.save();

        if (isReal) {
          ctx.fillStyle = '#c7bd4b';
        } else {
          ctx.shadowColor = 'white';
        }
        ctx.shadowBlur = 15;
        ctx.restore();
      } else if (
        hoverNodeId !== String(node.id) &&
        highlightNodeIdList.has(String(node.id)) &&
        pnl !== undefined
      ) {
        ctx.restore();
        ctx.beginPath();
        ctx.arc(
          node.x ?? 0,
          node.y ?? 0,
          getGraphNodeSize(pnl) / 2.5,
          0,
          2 * Math.PI,
          false,
        );
        if (isReal) {
          ctx.fillStyle = 'rgba(199, 189, 75, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }
        ctx.fill();
      }

      if (focusNodeId === String(node.id) && pnl !== undefined) {
        ctx.beginPath();
        ctx.arc(
          node.x ?? 0,
          node.y ?? 0,
          getGraphNodeSize(pnl) / 2.5,
          0,
          2 * Math.PI,
          false,
        );
        if (isReal) {
          ctx.fillStyle = 'rgba(199, 189, 75, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }
        ctx.fill();

        if (isReal) {
          ctx.fillStyle = 'rgba(199, 189, 75, 0.5)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        }
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(
          node.x ?? 0,
          node.y ?? 0,
          getGraphNodeSize(pnl) / 2.5,
          0,
          2 * Math.PI,
          false,
        );
        ctx.fill();

        ctx.save();
        if (isReal) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#c7bd4b';
        } else {
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'white';
        }
        ctx.shadowBlur = 15;
        ctx.restore();
      }

      if (shouldShowLabel) {
        let fontSize = sizeFactor / globalScale;

        fontSize = Math.max(minFont, Math.min(maxFont, fontSize));
        ctx.font = `${5}px Sans-Serif`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeText(label, node.x ?? 0, node.y ?? 0);
        ctx.fillText(label, node.x ?? 0, node.y ?? 0);
      }
    },
    [hoverNodeId, data, highlightNodeIdList],
  );

  useLayoutEffect(() => {
    if (isMount === false) {
      setIsMount(true);
    }

    return () => {
      setIsMount(false);
    };
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;

    graphRef.current.d3Force('collide', d3.forceCollide(30));

    if (graphRef.current.d3Force('link')) {
      graphRef.current.d3Force('link')?.distance(() => 1);
    }

    graphRef.current.d3Force('center', d3.forceCenter(0, 0));

    if (graphRef.current.d3Force('charge')) {
      graphRef.current.d3Force('charge')?.strength((node: Node) => {
        return -10;
      });
    }
  }, [data]);

  const show = useMemo(() => {
    return isMobile || isTablet;
  }, [isMobile, isTablet]);

  useEffect(() => {
    const canvasEl = document.querySelector('canvas');

    if (canvasEl) {
      const preventWheel = (e: any) => {
        e.preventDefault();
      };
      canvasEl.addEventListener('wheel', preventWheel, { passive: false });

      return () => {
        canvasEl.removeEventListener('wheel', preventWheel);
      };
    }
  }, []);

  return (
    <div className={cx('bubblemap-container')}>
      <ForceGraph2D
        width={window.innerWidth}
        height={window.innerHeight - 75}
        ref={graphRef}
        minZoom={0}
        // d3VelocityDecay={0.5}
        // d3AlphaDecay={0.2}
        cooldownTicks={Infinity} // 무한대로 시뮬레이션 유지 (onEngineStop 수동으로 처리할 것)
        d3AlphaDecay={0.02} // 천천히 수렴 (기본값은 0.0228)
        // d3AlphaMin={0.01} // 언제 엔진 멈출지 결정하는 기준 (작게 설정하면 더 오래 시뮬레이션)
        // enableNodeDrag={false}
        maxZoom={5}
        nodeRelSize={1}
        linkColor={() => 'rgba(255, 255, 255, 0.3'}
        graphData={data}
        // linkCurvature={0.1}
        // d3AlphaMin={0.1}
        nodeVal={(node) => {
          return getGraphNodeSize(node.pnl);
        }}
        autoPauseRedraw={false}
        // nodeLabel={(node) => {
        //   return node.name;
        // }}
        onNodeClick={(node) => {
          if (!activated || isMobile || isTablet) {
            router.push(`/agent/${node.id}`);
            return;
          }
          handleClick(node);
        }}
        backgroundColor="#000000"
        onNodeHover={(node) => {
          if (hoverNode) {
            if (node && node.id !== undefined) {
              hoverNode.current = node as Node;
              highlightNodeIdList.add(String(node.id));
              node.neighbors.forEach((neighbor: Node) => {
                highlightNodeIdList.add(neighbor.id);
              });
              node.links.forEach((link: Link) => highlightLinkList.add(link));
            } else {
              hoverNode.current = null;
              highlightNodeIdList.clear();
              highlightLinkList.clear();
            }
          }
          setHoverNodeId(String(node?.id) || null);
          updateHighlight();
        }}
        nodeCanvasObject={handleOverHighlight}
        nodeCanvasObjectMode={(node) => {
          return 'after';
          // if (node && node.id) {
          //   return highlightNodeList.has(String(node.id)) ? 'before' : 'after';
          // }
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(
            node.x ?? 0,
            node.y ?? 0,
            getGraphNodeSize(node.pnl) / 5,
            0,
            2 * Math.PI,
            false,
          );
          ctx.fill();
          ctx.restore();
        }}
        linkWidth={(link) => (highlightLinkList.has(link as Link) ? 2 : 1)}
        linkDirectionalParticles={1}
      />
      {!show && (
        <div
          className={cx('graph-controller-btn-wrapper', {
            open: isMount && open,
            close: !open,
          })}
        >
          <button
            className={cx('graph-controller-btn')}
            aria-label="graph-controller-minus"
            onClick={() => {
              if (graphRef && graphRef.current) {
                const zoomTransform = graphRef.current.zoom();
                graphRef.current.zoom(zoomTransform - 0.2, 1000);
              }
            }}
          >
            <FaMinus className={cx('graph-controller-btn-icon')} />
          </button>
          <button
            className={cx('graph-controller-btn')}
            aria-label="graph-controller-plus"
            onClick={() => {
              if (graphRef && graphRef.current) {
                const zoomTransform = graphRef.current.zoom();
                graphRef.current.zoom(zoomTransform + 0.2, 1000);
              }
            }}
          >
            <FaPlus className={cx('graph-controller-btn-icon')} />
          </button>
          <button
            className={cx('graph-controller-btn')}
            aria-label="graph-controller-plus"
            onClick={() => {
              if (graphRef && graphRef.current) {
                graphRef.current.zoomToFit(1000, 30);
                graphRef.current.centerAt(0, 0, 1000);
                // graphRef.current.zoom(1, 300);
              }
            }}
          >
            <BiReset className={cx('graph-controller-btn-icon')} />
          </button>
        </div>
      )}
      {!show && (
        <button
          className={cx('sidebar-ctrl-button', {
            open: isMount && open,
            close: !open,
          })}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <RxDoubleArrowRight
              className={cx('sidebar-ctrl-button-icon')}
              size={22}
            />
          ) : (
            <RxDoubleArrowLeft
              className={cx('sidebar-ctrl-button-icon')}
              size={22}
            />
          )}
        </button>
      )}
      {activated && (
        <div className={cx('card-wrapper')}>
          <FilterAgentCard />
          <RealTradingCard />
          {focusNodeId && <AgentCard id={focusNodeId} />}
        </div>
      )}
      <div
        className={cx('sidebar-wrapper', {
          open: isMount && open,
          close: !open,
        })}
      >
        <AgentSidebar onFocus={handleClick} ref={graphRef as any} />
      </div>
      {show && (
        <button
          className={cx('mobile-filter-button')}
          aria-label="mobile-filter-button"
          onClick={() => {
            dispatch(SET_MODAL({ key: 'filter-agent-modal' }));
          }}
        >
          <FaSliders className={cx('mobile-filter-button-icon')} size={16} />
        </button>
      )}
      {show && (
        <button
          className={cx('mobile-agentbar-button')}
          aria-label="mobile-agentbar-button"
          onClick={() => {
            dispatch(SET_MODAL({ key: 'agent-bar-modal' }));
          }}
        >
          <BsBarChart className={cx('mobile-agentbar-button-icon')} size={16} />
        </button>
      )}
      {show && (
        <button
          className={cx('mobile-picks-button')}
          aria-label="mobile-picks-button"
          onClick={() => {
            dispatch(SET_MODAL({ key: 'top-picks-modal' }));
          }}
        >
          <TbCoinBitcoin className={cx('mobile-picks-button-icon')} size={16} />
        </button>
      )}
      {filterAgentModal && filterAgentModal.key === 'filter-agent-modal' && (
        <FilterAgentModal />
      )}
      {agentBarModal && agentBarModal.key === 'agent-bar-modal' && (
        <AgentBarModal />
      )}
      {topPicksModal && topPicksModal.key === 'top-picks-modal' && (
        <TopPicksModal />
      )}
    </div>
  );
};

export default AgentBubbleMap;

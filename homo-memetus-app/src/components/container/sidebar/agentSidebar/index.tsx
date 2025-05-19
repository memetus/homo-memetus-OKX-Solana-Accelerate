import React, {
  forwardRef,
  MutableRefObject,
  Suspense,
  useCallback,
  useState,
} from 'react';
import styles from '@/components/container/sidebar/agentSidebar/AgentSideBar.module.scss';
import classNames from 'classnames/bind';
import AgentCardListContainer from '@/components/container/agentContainer/agentCardListContainer';
import TopPickCardListContainer from '@/components/container/agentContainer/topPickCardListContainer';
import { NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import SearchCardContainer from '../../agentContainer/searchCardListContainer';
import { useNetworkContext } from '@/states/partial/network/NetworkContext';

const cx = classNames.bind(styles);

enum SidebarTypeEnum {
  agent = 0,
  pick = 1,
  search = 2,
}

type Props = {
  onFocus: (node: NodeObject<NodeObject>) => void;
};

type Ref = {
  ref: MutableRefObject<ForceGraphMethods>;
};

const AgentSidebar = forwardRef<Ref, Props>(function AgentSidebarRef(
  { onFocus }: Props,
  ref,
) {
  const { sidebarType, setSidebarType } = useNetworkContext();

  const render = useCallback(() => {
    switch (sidebarType) {
      case SidebarTypeEnum.agent:
        return <AgentCardListContainer onFocus={onFocus} ref={ref} />;
      case SidebarTypeEnum.pick:
        return <TopPickCardListContainer />;
      case SidebarTypeEnum.search:
        return <SearchCardContainer />;
      default:
        return <AgentCardListContainer onFocus={onFocus} ref={ref} />;
    }
  }, [sidebarType]);

  return (
    <section className={cx('sidebar-container')}>
      <nav className={cx('sidebar-nav')}>
        <button
          onClick={() => setSidebarType(SidebarTypeEnum.agent)}
          className={cx('nav-item', {
            active: sidebarType === SidebarTypeEnum.agent,
          })}
        >
          <span className={cx('nav-text')}>TOP AGENTS</span>
        </button>
        <button
          onClick={() => setSidebarType(SidebarTypeEnum.pick)}
          className={cx('nav-item', {
            active: sidebarType === SidebarTypeEnum.pick,
          })}
        >
          <span className={cx('nav-text')}>TOP PICKS</span>
        </button>
        <button
          onClick={() => setSidebarType(SidebarTypeEnum.search)}
          className={cx('nav-item', {
            active: sidebarType === SidebarTypeEnum.search,
          })}
        >
          <span className={cx('nav-text')}>SEARCH</span>
        </button>
      </nav>
      {render()}
    </section>
  );
});

export default AgentSidebar;

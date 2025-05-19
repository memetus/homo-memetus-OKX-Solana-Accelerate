'use client';
import React, {
  MutableRefObject,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  NetworkContext,
  SidebarTypeEnum,
  Status,
} from '@/states/partial/network/NetworkContext';
import { Link, Node } from '@/shared/types/ui/graph';
import { ForceGraphMethods } from 'react-force-graph-2d';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@/shared/constants/api';
import { searchAgentBySymbol } from '@/shared/api/agent/api';
import { AgentSearchResultType } from '@/shared/types/data/agent.type';

type Props = {
  children: ReactNode;
  nodes: Node[];
  links: Link[];
};

const NetworkProvider = ({ children, nodes, links }: Props) => {
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  let focusNode: MutableRefObject<Node | null> = useRef<Node | null>(null);
  let hoverNode: MutableRefObject<Node | null> = useRef<Node | null>(null);
  const graphRef: MutableRefObject<ForceGraphMethods | null> =
    useRef<ForceGraphMethods | null>(null);
  let sidebarRef: MutableRefObject<boolean> = useRef<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [generation, setGeneration] = useState<number>(0);
  const [status, setStatus] = useState<Status>(Status.Servived);
  const [highlightNodeIdList, setHighlightNodeIdList] = useState<Set<string>>(
    new Set(),
  );
  const [highlightLinkList, setHighlightLinkList] = useState<Set<Link>>(
    new Set(),
  );
  const [searchResults, setSearchResults] = useState<AgentSearchResultType[]>(
    [],
  );
  const [sidebarType, setSidebarType] = useState<SidebarTypeEnum>(
    SidebarTypeEnum.agent,
  );

  const handleSearch = useCallback(() => {
    if (searchKeyword.length > 0) {
      searchMutation.mutate(searchKeyword.trim());
    }
  }, [searchKeyword]);

  const searchMutation = useMutation({
    mutationKey: [MUTATION_KEY.SEARCH_AGENT_BY_TOKEN_SYMBOL, searchKeyword],
    mutationFn: searchAgentBySymbol,
    onSuccess: (data) => {
      setSearchResults(data.results);
      highlightNodeIdList.clear();
      nodes.forEach((node) => {
        if (
          data.results.some(
            (result: AgentSearchResultType) => result.fundId === node.id,
          )
        ) {
          highlightNodeIdList.add(node.id);
        }
      });
      setHighlightNodeIdList(highlightNodeIdList);
      setSidebarType(SidebarTypeEnum.search);
    },
  });

  const searchResultAgents = useMemo(() => {
    const resultAgents = nodes.filter((node) =>
      searchResults.some((result) => result.fundId === node.id),
    );
    return resultAgents;
  }, [searchResults]);

  const recentGeneration = useMemo(() => {
    const generations = nodes.map((node) => node.generation);
    return Math.max(...generations);
  }, [nodes]);

  const contextValue = useMemo(() => {
    return {
      focusNode,
      hoverNode,
      sidebarRef,
      highlightNodeIdList,
      setHighlightNodeIdList,
      highlightLinkList,
      setHighlightLinkList,
      searchKeyword,
      setSearchKeyword,
      generation,
      setGeneration,
      status,
      setStatus,
      nodeList: nodes,
      linkList: links,
      recentGeneration,
      graphRef,
      focusNodeId,
      setFocusNodeId,
      searchResults,
      searchResultAgents,
      handleSearch,
      setSearchResults,
      sidebarType,
      setSidebarType,
    };
  }, [
    focusNodeId,
    focusNode,
    hoverNode,
    sidebarRef,
    searchKeyword,
    generation,
    status,
    highlightNodeIdList,
    highlightLinkList,
    recentGeneration,
    graphRef,
    searchResults,
    searchResultAgents,
    sidebarType,
  ]);
  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;

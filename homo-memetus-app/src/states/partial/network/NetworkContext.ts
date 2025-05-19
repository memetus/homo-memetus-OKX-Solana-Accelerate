import { AgentSearchResultType } from '@/shared/types/data/agent.type';
import { Link, Node } from '@/shared/types/ui/graph';
import React, {
  Context,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react';

export enum Status {
  Servived = 'Servived',
  Eliminated = 'Eliminated',
  All = 'All',
}

export enum SidebarTypeEnum {
  agent = 0,
  pick = 1,
  search = 2,
}

export type NetworkContextShape = {
  searchKeyword: string;
  setSearchKeyword: Dispatch<SetStateAction<string>>;
  generation: number;
  setGeneration: Dispatch<SetStateAction<number>>;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  focusNodeId: string | null;
  setFocusNodeId: Dispatch<SetStateAction<string | null>>;
  focusNode: React.MutableRefObject<Node | null> | undefined;
  hoverNode: React.MutableRefObject<Node | null> | undefined;
  sidebarRef: React.MutableRefObject<boolean> | undefined;
  highlightNodeIdList: Set<string>;
  setHighlightNodeIdList: Dispatch<SetStateAction<Set<string>>>;
  highlightLinkList: Set<Link>;
  setHighlightLinkList: Dispatch<SetStateAction<Set<Link>>>;
  nodeList: Node[];
  linkList: Link[];
  recentGeneration: number;
  searchResults: AgentSearchResultType[];
  setSearchResults: Dispatch<SetStateAction<AgentSearchResultType[]>>;
  searchResultAgents: Node[];
  handleSearch: () => void;
  sidebarType: SidebarTypeEnum;
  setSidebarType: Dispatch<SetStateAction<SidebarTypeEnum>>;
};

const defaultValue: NetworkContextShape = {
  focusNode: undefined,
  hoverNode: undefined,
  sidebarRef: undefined,
  searchKeyword: '',
  focusNodeId: null,
  setFocusNodeId: () => {},
  setSearchKeyword: () => {},
  generation: 0,
  setGeneration: () => {},
  status: Status.Servived,
  setStatus: () => {},
  highlightNodeIdList: new Set(),
  setHighlightNodeIdList: () => {},
  highlightLinkList: new Set(),
  setHighlightLinkList: () => {},
  nodeList: [],
  linkList: [],
  recentGeneration: 0,
  searchResults: [],
  setSearchResults: () => {},
  searchResultAgents: [],
  handleSearch: () => {},
  sidebarType: SidebarTypeEnum.agent,
  setSidebarType: () => {},
};

export const NetworkContext: Context<NetworkContextShape> =
  createContext<NetworkContextShape>(defaultValue);

export const useNetworkContext = () => {
  return useContext(NetworkContext);
};

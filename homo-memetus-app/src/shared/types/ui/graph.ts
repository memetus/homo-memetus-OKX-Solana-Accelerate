export type Node = {
  id: string;
  name: string;
  group: number;
  pnl: number;
  color: string;
  neighbors: Node[];
  links: Link[];
  survived: boolean;
  generation: number;
  realTrading: boolean;
};

export type Link = {
  source: string;
  target: string;
};

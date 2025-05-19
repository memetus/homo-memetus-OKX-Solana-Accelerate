import { AgentGraphType } from '../types/data/agent.type';
import { Link, Node } from '../types/ui/graph';
import * as THREE from 'three';

export function convertAgentGraphToGraphData(agents: AgentGraphType[]) {
  const fundIdToNodeMap = new Map<string, Node>();
  const pnlMap = new Map<string, number>();
  const realMap = new Map<string, boolean>();
  // const links: Link[] = [];

  agents.forEach((agent, index) => {
    const node: Node = {
      id: agent.fundId,
      name: agent.name,
      group: agent.generation,
      pnl: agent.totalPnL,
      color: '#ffffff',
      neighbors: [],
      links: [],
      survived: agent.survived,
      generation: agent.generation,
      realTrading: agent.realTrading,
    };
    pnlMap.set(agent.fundId, agent.totalPnL);
    realMap.set(agent.fundId, agent.realTrading);
    fundIdToNodeMap.set(agent.fundId, node);
  });

  agents.forEach((agent) => {
    const sourceNode = fundIdToNodeMap.get(agent.fundId);
    if (!sourceNode) return;

    agent.offspring.forEach((offspringId) => {
      const targetNode = fundIdToNodeMap.get(offspringId);
      if (!targetNode) return;

      // const link: Link = {
      //   source: agent.fundId,
      //   target: offspringId,
      // };
      // links.push(link);

      sourceNode.neighbors.push(targetNode);
      // sourceNode.links.push(link);

      targetNode.neighbors.push(sourceNode);
      // targetNode.links.push(link);
    });
  });

  const nodes = Array.from(fundIdToNodeMap.values());

  return {
    nodes,
    links: [],
    pnlMap,
    realMap,
  };
}

export function createTextSprite(text: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 48;

  if (context) {
    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.lineWidth = 6;
    context.strokeText(text, 0, fontSize);
    context.fillText(text, 0, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 5, 1); // 텍스트 크기 조절

    return sprite;
  }
}

export const getGraphNodeSize = (pnl: number) => {
  if (pnl < -100) {
    return 1;
  } else if (pnl >= -100 && pnl <= -90) {
    return 5;
  } else if (pnl > -90 && pnl <= -80) {
    return 10;
  } else if (pnl > -80 && pnl <= -70) {
    return 15;
  } else if (pnl > -70 && pnl <= -60) {
    return 20;
  } else if (pnl > -60 && pnl <= -50) {
    return 25;
  } else if (pnl > -50 && pnl <= -40) {
    return 30;
  } else if (pnl > -40 && pnl <= -30) {
    return 35;
  } else if (pnl > -30 && pnl <= -20) {
    return 40;
  } else if (pnl > -20 && pnl <= -10) {
    return 45;
  } else if (pnl > -10 && pnl <= 0) {
    return 50;
  } else if (pnl > 0 && pnl <= 10) {
    return 55;
  } else if (pnl > 10 && pnl <= 20) {
    return 60;
  } else if (pnl > 20 && pnl <= 30) {
    return 65;
  } else if (pnl > 30 && pnl <= 40) {
    return 70;
  } else if (pnl > 40 && pnl <= 50) {
    return 75;
  } else if (pnl > 50 && pnl <= 60) {
    return 80;
  } else if (pnl > 60 && pnl <= 70) {
    return 85;
  } else if (pnl > 70 && pnl <= 80) {
    return 90;
  } else if (pnl > 80 && pnl <= 90) {
    return 95;
  } else if (pnl > 90 && pnl <= 100) {
    return 100;
  } else return pnl;
};

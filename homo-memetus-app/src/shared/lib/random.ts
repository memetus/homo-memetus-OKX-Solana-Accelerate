export function genRandomTree(N: number = 300, reverse: boolean = false) {
  return {
    nodes: [...Array.from(Array(N).keys())].map((i) => ({ id: i })),
    links: Array.from(Array(N).keys())
      .filter((id) => id)
      .map((id) => ({
        [reverse ? 'target' : 'source']: id,
        [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1)),
      })),
  };
}

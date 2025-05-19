export const useSuspenseImage = (src: string, cache: Set<string>) => {
  if (!cache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        cache.add(src);
        resolve(null);
      };
      img.onerror = () => {
        cache.add(src);
      };
    });
  }
};

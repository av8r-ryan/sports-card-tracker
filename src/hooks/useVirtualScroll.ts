import { useState, useMemo, useCallback } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult<T> {
  items: T[];
  totalHeight: number;
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  startIndex: number;
  endIndex: number;
  visibleItems: T[];
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualScroll<T>(allItems: T[], options: VirtualScrollOptions): VirtualScrollResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = allItems.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(allItems.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return allItems.slice(startIndex, endIndex + 1);
  }, [allItems, startIndex, endIndex]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  return {
    items: allItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    startIndex,
    endIndex,
    visibleItems,
    handleScroll,
  };
}

export default useVirtualScroll;

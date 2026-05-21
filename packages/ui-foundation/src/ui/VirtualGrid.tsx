import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VirtualGridProps<T> = {
  items: T[];
  getKey: (item: T) => React.Key;
  renderItem: (item: T) => React.ReactNode;
  estimateItemHeight: number;
  gap?: number;
  overscanRows?: number;
  className?: string;
};

type VisibleRange = {
  startRow: number;
  endRow: number;
};

const getScrollParent = (element: HTMLElement | null): HTMLElement | Window => {
  if (!element) return window;

  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const canScroll = /(auto|scroll|overlay)/.test(
      `${style.overflow}${style.overflowY}`,
    );

    if (canScroll && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return window;
};

const getColumnCount = (width: number) => {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1;
};

const getRootRect = (root: HTMLElement | Window) => {
  if (root instanceof Window) {
    return {
      top: 0,
      bottom: root.innerHeight,
      height: root.innerHeight,
    };
  }

  const rect = root.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
    height: rect.height,
  };
};

const VirtualGrid = <T,>({
  items,
  getKey,
  renderItem,
  estimateItemHeight,
  gap = 16,
  overscanRows = 2,
  className = "",
}: VirtualGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    startRow: 0,
    endRow: 8,
  });

  const columnCount = getColumnCount(containerWidth);
  const rowCount = Math.ceil(items.length / columnCount);
  const rowStride = estimateItemHeight + gap;
  const totalHeight =
    rowCount === 0 ? 0 : rowCount * estimateItemHeight + (rowCount - 1) * gap;
  const columnWidth =
    columnCount > 0
      ? (containerWidth - gap * (columnCount - 1)) / columnCount
      : containerWidth;

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollRoot = getScrollParent(container);
    const rootRect = getRootRect(scrollRoot);
    const containerRect = container.getBoundingClientRect();

    const visibleTop = rootRect.top - containerRect.top;
    const visibleBottom = rootRect.bottom - containerRect.top;
    const nextStartRow = Math.max(
      0,
      Math.floor(visibleTop / rowStride) - overscanRows,
    );
    const nextEndRow = Math.min(
      rowCount,
      Math.ceil(visibleBottom / rowStride) + overscanRows,
    );

    setVisibleRange((current) =>
      current.startRow === nextStartRow && current.endRow === nextEndRow
        ? current
        : { startRow: nextStartRow, endRow: nextEndRow },
    );
  }, [overscanRows, rowCount, rowStride]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollRoot = getScrollParent(container);
    updateVisibleRange();
    scrollRoot.addEventListener("scroll", updateVisibleRange, {
      passive: true,
    });
    window.addEventListener("resize", updateVisibleRange);

    return () => {
      scrollRoot.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [updateVisibleRange]);

  useEffect(() => {
    updateVisibleRange();
  }, [containerWidth, items.length, updateVisibleRange]);

  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.startRow * columnCount;
    const endIndex = Math.min(items.length, visibleRange.endRow * columnCount);
    return items.slice(startIndex, endIndex).map((item, offset) => {
      const index = startIndex + offset;
      const row = Math.floor(index / columnCount);
      const column = index % columnCount;

      return {
        item,
        index,
        key: getKey(item),
        top: row * rowStride,
        left: column * (columnWidth + gap),
      };
    });
  }, [
    columnCount,
    columnWidth,
    gap,
    getKey,
    items,
    rowStride,
    visibleRange.endRow,
    visibleRange.startRow,
  ]);

  return (
    <div ref={containerRef} className={className}>
      <div className="relative w-full" style={{ height: totalHeight }}>
        {visibleItems.map(({ item, key, top, left }) => (
          <div
            key={key}
            className="absolute"
            style={{
              height: estimateItemHeight,
              left,
              top,
              width: columnWidth,
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualGrid;

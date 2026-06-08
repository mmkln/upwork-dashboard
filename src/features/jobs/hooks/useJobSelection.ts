import { useState, useCallback } from "react";

export function useJobSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectMany = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectMany = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  // Для поточної сторінки (пагінація)
  const selectAllOnPage = useCallback((pageIds: string[]) => {
    selectMany(pageIds);
  }, [selectMany]);

  const deselectAllOnPage = useCallback((pageIds: string[]) => {
    deselectMany(pageIds);
  }, [deselectMany]);

  const isAllSelectedOnPage = useCallback(
    (pageIds: string[]) => {
      if (pageIds.length === 0) return false;
      return pageIds.every((id) => selectedIds.has(id));
    },
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggle,
    selectMany,
    deselectMany,
    clear,
    isSelected,
    selectAllOnPage,
    deselectAllOnPage,
    isAllSelectedOnPage,
  };
}

export type JobSelection = ReturnType<typeof useJobSelection>;

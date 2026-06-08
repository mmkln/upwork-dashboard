import React from "react";
import { X } from "lucide-react";
import { Button, IconButton } from "../../../shared/ui";
import { cn } from "lib/utils";

interface BulkActionBarProps {
  selectedCount: number;
  isAllOnPageSelected: boolean;
  onToggleSelectAllOnPage: () => void;
  onClear: () => void;
  isBusy?: boolean;
  children?: React.ReactNode;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  isAllOnPageSelected,
  onToggleSelectAllOnPage,
  onClear,
  isBusy = false,
  children,
}) => {
  const isVisible = selectedCount > 0;

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-card z-40 flex justify-center px-card transition-all duration-motion-fast ease-motion-standard",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex flex-wrap items-center gap-control rounded-block border border-island-border bg-material-vibrant px-component py-control text-ui shadow-premium backdrop-blur-2xl",
          !isVisible && "invisible",
        )}
      >
        <span className="whitespace-nowrap text-text-primary">
          {selectedCount} job{selectedCount === 1 ? "" : "s"} selected
        </span>

        <Button size="sm" variant="ghost" onClick={onToggleSelectAllOnPage} disabled={isBusy}>
          {isAllOnPageSelected ? "Deselect page" : "Select all on this page"}
        </Button>

        <div className="flex items-center gap-item">{children}</div>

        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Clear selection"
          onClick={onClear}
          disabled={isBusy}
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default BulkActionBar;

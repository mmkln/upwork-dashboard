import React, { useState } from "react";
import { Folder, FolderOpen, FolderPlus, LayoutGrid } from "lucide-react";
import type { JobCollection } from "../../../models";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormField,
  IconButton,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  Textarea,
} from "../../../shared/ui";
import { cn } from "lib/utils";

type CollectionsDropdownProps = {
  collections: JobCollection[];
  selectedCollectionIds: number[];
  totalJobs: number;
  onCollectionChange: (collectionIds: number[]) => void;
  onCreateCollection: (
    name: string,
    description: string,
  ) => Promise<JobCollection>;
};

const CollectionsDropdown: React.FC<CollectionsDropdownProps> = ({
  collections,
  selectedCollectionIds,
  totalJobs,
  onCollectionChange,
  onCreateCollection,
}) => {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasSelectedCollection = selectedCollectionIds.length > 0;

  const resetCreateForm = () => {
    setCollectionName("");
    setCollectionDescription("");
    setCreateError(null);
  };

  const handleCreateCollection = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = collectionName.trim();
    const trimmedDescription = collectionDescription.trim();
    if (!trimmedName) {
      setCreateError("Collection name is required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const createdCollection = await onCreateCollection(
        trimmedName,
        trimmedDescription,
      );
      onCollectionChange([createdCollection.id]);
      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create collection. Please try again.";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="outline"
            size="sm"
            className={cn(
              "rounded-control",
              hasSelectedCollection && "bg-control-selected text-text-primary",
            )}
            title="Collections"
            aria-label="Open collections"
          >
            <Folder className="h-4 w-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="min-w-menu rounded-block p-control"
        >
          <DropdownMenuLabel className="px-control py-item text-ui text-text-primary">
            Collections
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="min-h-target gap-item px-control py-item text-text-secondary"
            onSelect={() => {
              resetCreateForm();
              setCreateDialogOpen(true);
            }}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Collection</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-control" />

          <DropdownMenuItem
            className={cn(
              "flex min-h-target flex-col items-start gap-micro px-control py-item",
              !hasSelectedCollection &&
                "bg-control-selected text-text-primary focus:bg-control-selected",
            )}
            onSelect={() => onCollectionChange([])}
          >
            <span className="flex items-center gap-item text-ui">
              <LayoutGrid className="h-4 w-4" />
              All jobs
            </span>
            {!hasSelectedCollection ? (
              <span className="text-label tabular-nums text-text-muted">
                {totalJobs.toLocaleString()} jobs
              </span>
            ) : null}
          </DropdownMenuItem>

          {collections.length > 0 ? (
            collections.map((collection) => {
              const isSelected = selectedCollectionIds.includes(collection.id);

              return (
                <DropdownMenuItem
                  key={collection.id}
                  className={cn(
                    "flex min-h-target flex-col items-start gap-micro px-control py-item",
                    isSelected &&
                      "bg-control-selected text-text-primary focus:bg-control-selected",
                  )}
                  onSelect={() => onCollectionChange([collection.id])}
                >
                  <span className="flex min-w-0 items-center gap-item text-ui">
                    {isSelected ? (
                      <FolderOpen className="h-4 w-4 shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{collection.name}</span>
                  </span>
                  {collection.description ? (
                    <span className="line-clamp-1 text-label text-text-muted">
                      {collection.description}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })
          ) : (
            <DropdownMenuItem disabled className="min-h-target px-control py-item">
              No collections
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-modal-lg gap-0 overflow-hidden p-0">
          <OverlayHeader>
            <DialogTitle>New Collection</DialogTitle>
            <DialogDescription>
              Create a collection for grouping jobs.
            </DialogDescription>
          </OverlayHeader>
          <form onSubmit={handleCreateCollection}>
            <OverlayBody className="space-y-component">
              {createError ? (
                <div
                  role="alert"
                  className="rounded-control bg-destructive-muted px-component py-control text-body text-destructive"
                >
                  {createError}
                </div>
              ) : null}
              <FormField
                autoFocus
                label="Name"
                value={collectionName}
                onValueChange={(value) => {
                  setCollectionName(value);
                  setCreateError(null);
                }}
                placeholder="Collection name"
                disabled={isCreating}
              />
              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Description</span>
                <Textarea
                  value={collectionDescription}
                  onChange={(event) => {
                    setCollectionDescription(event.target.value);
                    setCreateError(null);
                  }}
                  placeholder="Optional description"
                  disabled={isCreating}
                />
              </label>
            </OverlayBody>
            <OverlayFooter className="flex flex-col-reverse gap-control sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={isCreating || !collectionName.trim()}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </OverlayFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollectionsDropdown;

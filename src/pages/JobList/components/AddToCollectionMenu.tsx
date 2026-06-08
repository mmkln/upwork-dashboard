import React, { useState } from "react";
import { Folder, FolderPlus } from "lucide-react";
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

type AddToCollectionMenuProps = {
  collections: JobCollection[];
  disabled?: boolean;
  onSelectCollection: (collectionId: number) => void | Promise<void>;
  onCreateCollection: (name: string, description: string) => Promise<JobCollection>;
};

/**
 * Picker for the "add selected jobs to a collection" bulk action.
 * Unlike CollectionsDropdown (used for filtering), this has no "All jobs"
 * entry and no multi-select state — picking a collection applies immediately.
 */
const AddToCollectionMenu: React.FC<AddToCollectionMenuProps> = ({
  collections,
  disabled = false,
  onSelectCollection,
  onCreateCollection,
}) => {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const resetCreateForm = () => {
    setCollectionName("");
    setCollectionDescription("");
    setCreateError(null);
  };

  const handleCreateCollection = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const createdCollection = await onCreateCollection(trimmedName, trimmedDescription);
      resetCreateForm();
      setCreateDialogOpen(false);
      await onSelectCollection(createdCollection.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create collection. Please try again.";
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
            className="rounded-control"
            title="Add to collection"
            aria-label="Add selected jobs to collection"
            disabled={disabled}
          >
            <Folder className="h-4 w-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="min-w-menu rounded-block p-control">
          <DropdownMenuLabel className="px-control py-item text-ui text-text-primary">
            Add to collection
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="min-h-target gap-item px-control py-item text-text-secondary"
            onSelect={() => {
              resetCreateForm();
              setCreateDialogOpen(true);
            }}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New collection</span>
          </DropdownMenuItem>

          {collections.length > 0 && <DropdownMenuSeparator className="my-control" />}

          {collections.length > 0 ? (
            collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                className="flex min-h-target flex-col items-start gap-micro px-control py-item"
                onSelect={() => onSelectCollection(collection.id)}
              >
                <span className="flex min-w-0 items-center gap-item text-ui">
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{collection.name}</span>
                </span>
                {collection.description ? (
                  <span className="line-clamp-1 text-label text-text-muted">
                    {collection.description}
                  </span>
                ) : null}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled className="min-h-target px-control py-item">
              No collections yet
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-modal-lg gap-0 overflow-hidden p-0">
          <OverlayHeader>
            <DialogTitle>New Collection</DialogTitle>
            <DialogDescription>Create a collection and add the selected jobs to it.</DialogDescription>
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
              <Button variant="ghost" size="sm" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isCreating || !collectionName.trim()}>
                {isCreating ? "Creating..." : "Create & add"}
              </Button>
            </OverlayFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToCollectionMenu;

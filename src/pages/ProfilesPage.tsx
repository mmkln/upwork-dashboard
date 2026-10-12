import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  ProfileCard,
  ProfileDetailsSheet,
  ProfileOrdering,
  useProfiles,
} from "../features/profiles";
import {
  Button,
  ContentToolbar,
  EmptyState,
  Input,
  PageShell,
  Select,
} from "../shared/ui";

const PAGE_SIZE = 30;
const ORDERING_VALUES: ProfileOrdering[] = [
  "updated",
  "created",
  "name",
  "rate",
  "success",
];

const getPositiveInteger = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const isProfileOrdering = (value: string | null): value is ProfileOrdering =>
  ORDERING_VALUES.includes(value as ProfileOrdering);

const ProfileCardSkeleton = () => (
  <div className="min-h-[286px] animate-pulse rounded-block border border-border bg-block p-block">
    <div className="flex gap-component">
      <div className="h-12 w-12 rounded-full bg-block-subtle" />
      <div className="flex-1 space-y-item">
        <div className="h-5 w-2/3 rounded-control bg-block-subtle" />
        <div className="h-4 w-full rounded-control bg-block-subtle" />
      </div>
    </div>
    <div className="mt-card h-16 rounded-control bg-block-subtle" />
    <div className="mt-card h-20 rounded-control bg-block-subtle" />
  </div>
);

const ProfilesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = getPositiveInteger(searchParams.get("page"));
  const search = searchParams.get("search")?.trim() ?? "";
  const orderingParam = searchParams.get("ordering");
  const ordering = isProfileOrdering(orderingParam)
    ? orderingParam
    : "updated";
  const selectedProfileId = searchParams.get("profile");
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => setSearchDraft(search), [search]);

  const query = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      ordering,
    }),
    [ordering, page, search],
  );
  const profilesQuery = useProfiles(query);
  const totalProfiles = profilesQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProfiles / PAGE_SIZE));
  const firstVisible = totalProfiles === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastVisible = Math.min(page * PAGE_SIZE, totalProfiles);

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    setSearchParams(nextParams);
  };

  useEffect(() => {
    if (profilesQuery.data && page > totalPages) {
      updateParams({ page: String(totalPages), profile: null });
    }
    // updateParams intentionally uses the current URL state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, profilesQuery.data, totalPages]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParams({
      search: searchDraft.trim() || null,
      page: null,
      profile: null,
    });
  };

  const clearSearch = () => {
    setSearchDraft("");
    updateParams({ search: null, page: null, profile: null });
  };

  const profiles = profilesQuery.data?.results ?? [];

  return (
    <PageShell width="full">
      <ContentToolbar className="rounded-none bg-transparent p-0">
        <div className="grid gap-component xl:grid-cols-[minmax(220px,1fr)_minmax(320px,520px)_auto] xl:items-center">
          <div className="min-w-0">
            <p className="text-ui text-text-primary">
              {profilesQuery.isLoading
                ? "Loading profiles..."
                : `${totalProfiles.toLocaleString()} saved profiles`}
            </p>
            <p className="mt-micro text-label text-text-muted">
              {profilesQuery.isLoading
                ? "Preparing your freelancer library"
                : `Showing ${firstVisible}-${lastVisible} · Page ${page} of ${totalPages}`}
            </p>
          </div>

          <form className="flex min-w-0 items-center gap-item" onSubmit={submitSearch}>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-component top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search name or specialty"
                aria-label="Search saved profiles"
                className="pl-10 pr-10"
              />
              {searchDraft && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-item top-1/2 flex h-control-small w-control-small -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-control-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          <label className="flex items-center gap-item text-ui text-text-secondary xl:justify-self-end">
            Sort
            <Select
              className="w-auto min-w-[168px]"
              value={ordering}
              onChange={(event) =>
                updateParams({
                  ordering: event.target.value,
                  page: null,
                  profile: null,
                })
              }
            >
              <option value="updated">Recently updated</option>
              <option value="created">Recently saved</option>
              <option value="name">Name</option>
              <option value="rate">Highest rate</option>
              <option value="success">Highest success</option>
            </Select>
          </label>
        </div>
      </ContentToolbar>

      {profilesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-component md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProfileCardSkeleton key={index} />
          ))}
        </div>
      ) : profilesQuery.isError ? (
        <EmptyState
          title="Could not load saved profiles"
          description="Check that the local backend is running and try again."
          action={
            <Button size="sm" onClick={() => void profilesQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : profiles.length === 0 ? (
        <EmptyState
          title={search ? "No matching profiles" : "No saved profiles yet"}
          description={
            search
              ? "Try a broader name or specialty."
              : "Save a freelancer from the Upwork extension and the profile will appear here."
          }
          action={
            search ? (
              <Button size="sm" variant="soft" onClick={clearSearch}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-component transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
            profilesQuery.isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onOpen={(id) => updateParams({ profile: id })}
            />
          ))}
        </div>
      )}

      {!profilesQuery.isLoading && !profilesQuery.isError && totalProfiles > 0 && (
        <nav
          className="flex flex-col gap-item border-t border-border pt-component sm:flex-row sm:items-center sm:justify-between"
          aria-label="Profiles pagination"
        >
          <p className="text-label text-text-muted">
            {firstVisible}-{lastVisible} of {totalProfiles.toLocaleString()}
          </p>
          <div className="flex items-center gap-item">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || profilesQuery.isFetching}
              onClick={() =>
                updateParams({ page: String(page - 1), profile: null })
              }
            >
              Previous
            </Button>
            <span className="min-w-[88px] text-center text-label tabular-nums text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || profilesQuery.isFetching}
              onClick={() =>
                updateParams({ page: String(page + 1), profile: null })
              }
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      <ProfileDetailsSheet
        profileId={selectedProfileId}
        onClose={() => updateParams({ profile: null })}
      />
    </PageShell>
  );
};

export default ProfilesPage;

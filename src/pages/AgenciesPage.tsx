import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  AgencyCard,
  AgencyDetailsSheet,
  AgencyOrdering,
  useAgencies,
} from "../features/agencies";
import {
  Button,
  ContentToolbar,
  EmptyState,
  Input,
  PageShell,
  Select,
} from "../shared/ui";

const PAGE_SIZE = 30;
const ORDERING_VALUES: AgencyOrdering[] = [
  "updated",
  "created",
  "name",
  "success",
  "earned",
];

const getPositiveInteger = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const isAgencyOrdering = (value: string | null): value is AgencyOrdering =>
  ORDERING_VALUES.includes(value as AgencyOrdering);

const AgencyCardSkeleton = () => (
  <div className="min-h-[286px] animate-pulse rounded-block bg-block p-block">
    <div className="flex items-start justify-between gap-component">
      <div className="h-5 w-1/2 rounded-control bg-block-subtle" />
      <div className="h-4 w-16 rounded-control bg-block-subtle" />
    </div>
    <div className="mt-item h-10 rounded-control bg-block-subtle" />
    <div className="mt-card h-20 rounded-control bg-block-subtle" />
    <div className="mt-card h-4 w-24 rounded-control bg-block-subtle" />
  </div>
);

const AgenciesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = getPositiveInteger(searchParams.get("page"));
  const search = searchParams.get("search")?.trim() ?? "";
  const orderingParam = searchParams.get("ordering");
  const ordering = isAgencyOrdering(orderingParam)
    ? orderingParam
    : "updated";
  const selectedAgencyId = searchParams.get("agency");
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
  const agenciesQuery = useAgencies(query);
  const totalAgencies = agenciesQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalAgencies / PAGE_SIZE));
  const firstVisible = totalAgencies === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastVisible = Math.min(page * PAGE_SIZE, totalAgencies);

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    setSearchParams(nextParams);
  };

  useEffect(() => {
    if (agenciesQuery.data && page > totalPages) {
      updateParams({ page: String(totalPages), agency: null });
    }
    // updateParams intentionally uses the current URL state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenciesQuery.data, page, totalPages]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParams({
      search: searchDraft.trim() || null,
      page: null,
      agency: null,
    });
  };

  const clearSearch = () => {
    setSearchDraft("");
    updateParams({ search: null, page: null, agency: null });
  };

  const agencies = agenciesQuery.data?.results ?? [];

  return (
    <PageShell width="full">
      <ContentToolbar className="rounded-none bg-transparent p-0">
        <div className="grid gap-component xl:grid-cols-[minmax(220px,1fr)_minmax(320px,520px)_auto] xl:items-center">
          <div className="min-w-0">
            <p className="text-ui text-text-primary">
              {agenciesQuery.isLoading
                ? "Loading agencies..."
                : `${totalAgencies.toLocaleString()} saved agencies`}
            </p>
            {!agenciesQuery.isLoading && (
              <p className="mt-micro text-label text-text-muted">
                Showing {firstVisible}-{lastVisible} · Page {page} of {totalPages}
              </p>
            )}
          </div>

          <form
            className="flex min-w-0 items-center gap-item"
            onSubmit={submitSearch}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-component top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search agencies"
                aria-label="Search saved agencies"
                className="pl-10 pr-10"
              />
              {searchDraft && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-item top-1/2 flex h-control-small w-control-small -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  agency: null,
                })
              }
            >
              <option value="updated">Recently updated</option>
              <option value="created">Recently saved</option>
              <option value="name">Name</option>
              <option value="success">Highest success</option>
              <option value="earned">Highest earnings</option>
            </Select>
          </label>
        </div>
      </ContentToolbar>

      {agenciesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-component md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <AgencyCardSkeleton key={index} />
          ))}
        </div>
      ) : agenciesQuery.isError ? (
        <EmptyState
          title="Could not load saved agencies"
          description="Check that the backend is running and try again."
          action={
            <Button size="sm" onClick={() => void agenciesQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : agencies.length === 0 ? (
        <EmptyState
          title={search ? "No matching agencies" : "No saved agencies yet"}
          description={
            search
              ? "Try a broader agency name."
              : "Save an agency from the Upwork extension and it will appear here."
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
          className={`grid grid-cols-1 gap-component transition-opacity duration-motion-fast ease-motion-standard md:grid-cols-2 xl:grid-cols-3 ${
            agenciesQuery.isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {agencies.map((agency) => (
            <AgencyCard
              key={agency.record_id}
              agency={agency}
              onOpen={(recordId) => updateParams({ agency: recordId })}
            />
          ))}
        </div>
      )}

      {!agenciesQuery.isLoading &&
        !agenciesQuery.isError &&
        totalAgencies > 0 && (
          <nav
            className="flex flex-col gap-item border-t border-border pt-component sm:flex-row sm:items-center sm:justify-between"
            aria-label="Agencies pagination"
          >
            <p className="text-label text-text-muted">
              {firstVisible}-{lastVisible} of {totalAgencies.toLocaleString()}
            </p>
            <div className="flex items-center gap-item">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1 || agenciesQuery.isFetching}
                onClick={() =>
                  updateParams({ page: String(page - 1), agency: null })
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
                disabled={page >= totalPages || agenciesQuery.isFetching}
                onClick={() =>
                  updateParams({ page: String(page + 1), agency: null })
                }
              >
                Next
              </Button>
            </div>
          </nav>
        )}

      <AgencyDetailsSheet
        agencyRecordId={selectedAgencyId}
        onClose={() => updateParams({ agency: null })}
      />
    </PageShell>
  );
};

export default AgenciesPage;

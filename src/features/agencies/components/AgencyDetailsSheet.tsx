import React, { useEffect, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { formatCurrency } from "../../../shared/formatters";
import {
  Badge,
  Button,
  DetailRow,
  EmptyState,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../shared/ui";
import {
  formatLowerBoundCurrency,
  formatRateRange,
} from "../formatters";
import { useAgency } from "../queries";
import type { AgencyPersonPreview } from "../types";

type AgencyDetailsSheetProps = {
  agencyRecordId: string | null;
  onClose: () => void;
};

type TagSectionProps = {
  title: string;
  values: string[];
  tone?: "neutral" | "info" | "success" | "warning";
};

const TagSection: React.FC<TagSectionProps> = ({
  title,
  values,
  tone = "neutral",
}) => {
  if (values.length === 0) return null;

  return (
    <section>
      <h3 className="text-ui text-text-primary">{title}</h3>
      <div className="mt-item flex flex-wrap gap-tag">
        {values.map((value) => (
          <Badge key={value} tone={tone}>
            {value}
          </Badge>
        ))}
      </div>
    </section>
  );
};

type PeopleSectionProps = {
  title: string;
  people: AgencyPersonPreview[];
};

const PeopleSection: React.FC<PeopleSectionProps> = ({ title, people }) => {
  if (people.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-item">
        <h3 className="text-ui text-text-primary">{title}</h3>
        <span className="text-label tabular-nums text-text-muted">
          {people.length}
        </span>
      </div>
      <ul className="mt-item divide-y divide-border">
        {people.map((person, index) => (
          <li
            key={`${person.profile_url}-${person.name}-${index}`}
            className="flex items-center justify-between gap-component py-item first:pt-0 last:pb-0"
          >
            <span className="min-w-0 truncate text-body text-text-secondary">
              {person.name}
            </span>
            {person.profile_url && (
              <a
                href={person.profile_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-label text-link hover:underline"
              >
                Open profile
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

const LoadingDetails = () => (
  <div className="space-y-component p-block" aria-label="Loading agency">
    <div className="h-20 animate-pulse rounded-block bg-block-subtle" />
    <div className="h-28 animate-pulse rounded-block bg-block-subtle" />
    <div className="h-48 animate-pulse rounded-block bg-block-subtle" />
  </div>
);

const AgencyDetailsSheet: React.FC<AgencyDetailsSheetProps> = ({
  agencyRecordId,
  onClose,
}) => {
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const { data: agency, isLoading, isError, refetch } =
    useAgency(agencyRecordId);
  const hasLongOverview = (agency?.overview?.length ?? 0) > 500;

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [agencyRecordId]);

  return (
    <Sheet
      open={Boolean(agencyRecordId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent size="lg" className="flex flex-col p-0">
        {!agency && (
          <SheetHeader className="sr-only">
            <SheetTitle>Agency details</SheetTitle>
            <SheetDescription>Saved Upwork agency details.</SheetDescription>
          </SheetHeader>
        )}

        {isLoading ? (
          <LoadingDetails />
        ) : isError || !agency ? (
          <OverlayBody>
            <EmptyState
              title="Could not load this agency"
              description="Check the backend connection and try again."
              action={
                <Button size="sm" onClick={() => void refetch()}>
                  Try again
                </Button>
              }
            />
          </OverlayBody>
        ) : (
          <>
            <OverlayHeader className="pr-16">
              <SheetTitle className="line-clamp-2">{agency.name}</SheetTitle>
              <SheetDescription className="line-clamp-2">
                {agency.tagline || "Upwork agency"}
              </SheetDescription>
            </OverlayHeader>

            <OverlayBody className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-card">
                <section className="grid grid-cols-2 gap-item sm:grid-cols-4">
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Job success</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {agency.job_success === null
                        ? "—"
                        : `${agency.job_success}%`}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Total earned</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {formatLowerBoundCurrency(
                        agency.total_earned,
                        agency.total_earned_is_lower_bound,
                      )}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Total jobs</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {agency.total_jobs?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Total hours</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {agency.total_hours?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                </section>

                {agency.overview && (
                  <section>
                    <h3 className="text-ui text-text-primary">Overview</h3>
                    <p
                      className={`mt-item whitespace-pre-wrap text-body leading-relaxed text-text-secondary ${
                        hasLongOverview && !isOverviewExpanded
                          ? "line-clamp-6"
                          : ""
                      }`}
                    >
                      {agency.overview}
                    </p>
                    {hasLongOverview && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="mt-item"
                        aria-expanded={isOverviewExpanded}
                        onClick={() =>
                          setIsOverviewExpanded((expanded) => !expanded)
                        }
                      >
                        {isOverviewExpanded ? "Show less" : "Show more"}
                      </Button>
                    )}
                  </section>
                )}

                <TagSection title="Services" values={agency.services ?? []} tone="info" />
                <TagSection title="Skills" values={agency.skills ?? []} tone="info" />
                <TagSection title="Badges" values={agency.badges ?? []} tone="success" />
                <TagSection
                  title="Featured clients"
                  values={agency.featured_clients ?? []}
                />
                <TagSection title="Client focus" values={agency.client_focus ?? []} />

                <section>
                  <h3 className="text-ui text-text-primary">Company information</h3>
                  <div className="mt-item divide-y divide-border">
                    <DetailRow
                      label="Hourly rate"
                      value={formatRateRange(
                        agency.hourly_rate_min,
                        agency.hourly_rate_max,
                      )}
                    />
                    <DetailRow
                      label="Minimum project"
                      value={
                        agency.minimum_project_size === null
                          ? "—"
                          : `${agency.minimum_project_size_is_lower_bound ? "From " : ""}${formatCurrency(
                              agency.minimum_project_size,
                            )}`
                      }
                    />
                    <DetailRow label="Agency size" value={agency.agency_size} />
                    <DetailRow
                      label="Year founded"
                      value={agency.year_founded?.toString()}
                    />
                    <DetailRow label="Member since" value={agency.member_since} />
                    <DetailRow
                      label="Upwork agency ID"
                      value={agency.upwork_agency_id}
                    />
                  </div>
                </section>

                {(agency.office_locations ?? []).length > 0 && (
                  <section>
                    <h3 className="text-ui text-text-primary">Office locations</h3>
                    <ul className="mt-item divide-y divide-border">
                      {agency.office_locations.map((office, index) => (
                        <li
                          key={`${office.location}-${index}`}
                          className="flex items-start gap-item py-item first:pt-0 last:pb-0"
                        >
                          <MapPin className="mt-micro h-4 w-4 shrink-0 text-text-muted" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-tag">
                              <span className="text-body text-text-secondary">
                                {office.location}
                              </span>
                              {office.is_primary && <Badge>Primary</Badge>}
                            </div>
                            {office.local_time && (
                              <p className="mt-micro text-label text-text-muted">
                                {office.local_time}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(agency.languages ?? []).length > 0 && (
                  <section>
                    <h3 className="text-ui text-text-primary">Languages</h3>
                    <div className="mt-item divide-y divide-border">
                      {agency.languages.map((language, index) => (
                        <DetailRow
                          key={`${language.language}-${index}`}
                          label={language.language}
                          value={language.proficiency}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <PeopleSection
                  title="Business managers"
                  people={agency.business_managers ?? []}
                />
                <PeopleSection title="Agency members" people={agency.members ?? []} />
              </div>
            </OverlayBody>

            <OverlayFooter className="flex items-center justify-between gap-component">
              <p className="text-label text-text-muted">
                Updated{" "}
                {new Date(agency.updated_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <Button asChild size="sm">
                <a href={agency.profile_url} target="_blank" rel="noreferrer">
                  Open on Upwork
                  <ExternalLink className="ml-item h-4 w-4" />
                </a>
              </Button>
            </OverlayFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AgencyDetailsSheet;

import React, { useEffect, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../shared/ui";
import {
  formatCompactCurrency,
  formatCurrency,
  formatLocation,
} from "../formatters";
import { useProfile } from "../queries";

type ProfileDetailsSheetProps = {
  profileId: string | null;
  onClose: () => void;
};

const LoadingDetails = () => (
  <div className="space-y-component p-block" aria-label="Loading profile">
    <div className="h-20 animate-pulse rounded-block bg-block-subtle" />
    <div className="h-32 animate-pulse rounded-block bg-block-subtle" />
    <div className="h-48 animate-pulse rounded-block bg-block-subtle" />
  </div>
);

const ProfileDetailsSheet: React.FC<ProfileDetailsSheetProps> = ({
  profileId,
  onClose,
}) => {
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const { data: profile, isLoading, isError, refetch } = useProfile(profileId);
  const hasLongOverview = (profile?.overview?.length ?? 0) > 500;

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [profileId]);

  return (
    <Sheet
      open={Boolean(profileId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex flex-col p-0 sm:max-w-[640px]">
        {!profile && (
          <SheetHeader className="sr-only">
            <SheetTitle>Freelancer profile</SheetTitle>
            <SheetDescription>
              Saved Upwork freelancer profile details.
            </SheetDescription>
          </SheetHeader>
        )}
        {isLoading ? (
          <LoadingDetails />
        ) : isError || !profile ? (
          <div className="p-block">
            <EmptyState
              title="Could not load this profile"
              description="Check the backend connection and try again."
              action={
                <Button size="sm" onClick={() => void refetch()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b border-border p-block pr-16">
              <SheetTitle className="line-clamp-2">
                {profile.name}
              </SheetTitle>
              <SheetDescription className="line-clamp-2">
                {profile.title || "Freelancer"}
              </SheetDescription>
              <p className="flex items-center gap-micro text-label text-text-muted">
                <MapPin className="h-4 w-4" />
                {formatLocation(profile.city, profile.country)}
              </p>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-block">
              <div className="space-y-card">
                <section className="grid grid-cols-2 gap-item sm:grid-cols-4">
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Hourly rate</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {formatCurrency(profile.hourly_rate, "/hr")}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Job success</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {profile.job_success === null
                        ? "—"
                        : `${profile.job_success}%`}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Total earned</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {formatCompactCurrency(profile.total_earned)}
                    </p>
                  </div>
                  <div className="rounded-control bg-block-subtle p-component">
                    <p className="text-label text-text-muted">Total jobs</p>
                    <p className="mt-micro text-ui tabular-nums text-text-primary">
                      {profile.total_jobs?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                </section>

                {profile.overview && (
                  <section>
                    <h3 className="text-ui text-text-primary">Overview</h3>
                    <p
                      className={`mt-item whitespace-pre-wrap text-body leading-relaxed text-text-secondary ${
                        hasLongOverview && !isOverviewExpanded
                          ? "line-clamp-6"
                          : ""
                      }`}
                    >
                      {profile.overview}
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

                <section>
                  <h3 className="text-ui text-text-primary">Skills</h3>
                  <div className="mt-item flex flex-wrap gap-tag">
                    {(profile.skills ?? []).map((skill) => (
                      <Badge key={skill} tone="info">
                        {skill}
                      </Badge>
                    ))}
                    {(profile.skills ?? []).length === 0 && (
                      <p className="text-body text-text-muted">
                        No skills listed.
                      </p>
                    )}
                  </div>
                </section>

                {(profile.badges ?? []).length > 0 && (
                  <section>
                    <h3 className="text-ui text-text-primary">Badges</h3>
                    <div className="mt-item flex flex-wrap gap-tag">
                      {(profile.badges ?? []).map((badge) => (
                        <Badge key={badge} tone="success">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center justify-between gap-item">
                    <h3 className="text-ui text-text-primary">Work history</h3>
                    <span className="text-label tabular-nums text-text-muted">
                      {(profile.work_history ?? []).length} contracts
                    </span>
                  </div>
                  <div className="mt-item space-y-item">
                    {(profile.work_history ?? []).slice(0, 20).map((item, index) => (
                      <article
                        key={`${item.title}-${item.period ?? index}`}
                        className="rounded-control border border-border p-component"
                      >
                        <div className="flex items-start justify-between gap-item">
                          <h4 className="text-body text-text-primary">
                            {item.title}
                          </h4>
                          <Badge
                            tone={item.status === "completed" ? "neutral" : "success"}
                          >
                            {item.status === "completed" ? "Completed" : "In progress"}
                          </Badge>
                        </div>
                        <div className="mt-micro flex flex-wrap gap-component text-label text-text-muted">
                          {item.period && <span>{item.period}</span>}
                          {item.rating !== null && <span>{item.rating}/5</span>}
                        </div>
                        {item.feedback && (
                          <p className="mt-item line-clamp-3 text-body text-text-secondary">
                            {item.feedback}
                          </p>
                        )}
                      </article>
                    ))}
                    {(profile.work_history ?? []).length === 0 && (
                      <p className="text-body text-text-muted">
                        No work history saved.
                      </p>
                    )}
                  </div>
                </section>

                {(profile.project_catalog ?? []).length > 0 && (
                  <section>
                    <h3 className="text-ui text-text-primary">Project catalog</h3>
                    <div className="mt-item space-y-item">
                      {profile.project_catalog.map((project) => (
                        <article
                          key={project.id}
                          className="rounded-control bg-block-subtle p-component"
                        >
                          <p className="text-body text-text-primary">
                            {project.title}
                          </p>
                          <p className="mt-micro text-label text-text-muted">
                            {project.price_from === null
                              ? "Price not provided"
                              : `From ${formatCurrency(project.price_from)}`}
                            {project.delivery_days === null
                              ? ""
                              : ` · ${project.delivery_days} days`}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-component border-t border-border p-component">
              <p className="text-label text-text-muted">
                Updated{" "}
                {new Date(profile.updated_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {profile.profile_url && (
                <Button asChild size="sm">
                  <a
                    href={profile.profile_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on Upwork
                    <ExternalLink className="ml-item h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDetailsSheet;

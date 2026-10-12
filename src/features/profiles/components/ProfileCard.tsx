import React from "react";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { Badge, Card } from "../../../shared/ui";
import {
  formatCompactCurrency,
  formatCurrency,
  formatLocation,
} from "../formatters";
import type { ProfileListItem } from "../types";

type ProfileCardProps = {
  profile: ProfileListItem;
  onOpen: (id: string) => void;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onOpen }) => {
  const skills = profile.skills ?? [];
  const visibleSkills = skills.slice(0, 4);
  const hiddenSkillsCount = Math.max(0, skills.length - visibleSkills.length);

  return (
    <Card className="flex h-full min-h-[286px] flex-col border border-border p-0 transition-[border-color,box-shadow] duration-motion-fast hover:border-action/40 hover:shadow-block">
      <button
        type="button"
        className="flex flex-1 flex-col gap-card p-block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => onOpen(profile.id)}
        aria-label={`View ${profile.name}`}
      >
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-component">
            <h2 className="line-clamp-1 min-w-0 text-ui text-text-primary">
              {profile.name}
            </h2>
            <span className="shrink-0 text-ui tabular-nums text-text-primary">
              {formatCurrency(profile.hourly_rate, "/hr")}
            </span>
          </div>
          <p className="mt-micro line-clamp-2 min-h-[40px] text-body text-text-secondary">
            {profile.title || "Freelancer"}
          </p>
        </div>

        <div className="flex items-center gap-item text-label text-text-muted">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {formatLocation(profile.city, profile.country)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-item rounded-control bg-block-subtle p-component">
          <div>
            <p className="text-label text-text-muted">Job success</p>
            <p className="mt-micro text-ui tabular-nums text-text-primary">
              {profile.job_success === null ? "—" : `${profile.job_success}%`}
            </p>
          </div>
          <div>
            <p className="text-label text-text-muted">Earned</p>
            <p className="mt-micro text-ui tabular-nums text-text-primary">
              {formatCompactCurrency(profile.total_earned)}
            </p>
          </div>
          <div>
            <p className="text-label text-text-muted">Jobs</p>
            <p className="mt-micro flex items-center gap-micro text-ui tabular-nums text-text-primary">
              <BriefcaseBusiness className="h-4 w-4 text-text-muted" />
              {profile.total_jobs?.toLocaleString() ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-auto flex min-h-control-small flex-wrap content-start gap-tag">
          {visibleSkills.map((skill) => (
            <Badge key={skill} tone="info">
              {skill}
            </Badge>
          ))}
          {hiddenSkillsCount > 0 && (
            <Badge tone="neutral">+{hiddenSkillsCount}</Badge>
          )}
          {skills.length === 0 && (
            <span className="text-label text-text-muted">No skills listed</span>
          )}
        </div>
      </button>
    </Card>
  );
};

export default ProfileCard;

import React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import { UpworkJob } from "../../models";
import { isToday } from "../../utils";
import { Card } from "../../shared/ui";

interface JobCalendarProps {
  jobs: UpworkJob[];
  month: Date;
}

const getIntensityClass = (jobCount: number, isCurrentDay = false): string => {
  if (isCurrentDay) {
    if (jobCount === 0) return "border-action/30 bg-fill-tertiary text-action";
    if (jobCount <= 12) return "border-action/30 bg-action-muted text-action";
    return "border-action bg-action text-action-foreground";
  }

  if (jobCount === 0) {
    return "border-transparent bg-fill-quaternary text-text-quaternary";
  }
  if (jobCount <= 5) {
    return "border-transparent bg-fill-tertiary text-text-secondary";
  }
  if (jobCount <= 12) {
    return "border-transparent bg-fill-secondary text-text-primary";
  }
  return "border-action/20 bg-action-muted text-action";
};

const JobCalendar: React.FC<JobCalendarProps> = ({ jobs, month }) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start, end });

  const jobCountPerDay: Record<string, number> = jobs.reduce(
    (acc, job) => {
      const jobDate = format(new Date(job.created_at), "yyyy-MM-dd");
      acc[jobDate] = (acc[jobDate] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const leadingDays = Array.from({ length: getDay(start) }).map((_, index) => (
    <div key={`leading-${index}`} className="h-control-mini w-control-mini" />
  ));

  const trailingDays = Array.from({ length: 6 - getDay(end) }).map((_, index) => (
    <div key={`trailing-${index}`} className="h-control-mini w-control-mini" />
  ));

  return (
    <Card className="w-72 p-card">
      <div className="space-y-component">
        <h2 className="text-heading text-text-primary">
          {format(month, "MMMM, yyyy")}
        </h2>
        <div className="grid grid-cols-7 gap-tag">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={day} className="text-center text-label text-text-muted">
              {day}
            </div>
          ))}

          {leadingDays}

          {daysInMonth.map((day) => {
            const formattedDay = format(day, "yyyy-MM-dd");
            const jobCount = jobCountPerDay[formattedDay] || 0;
            const colorClass = getIntensityClass(jobCount, isToday(day));

            return (
              <div key={formattedDay} className="flex justify-center">
                <div
                  className={`group/day relative flex h-control-mini w-control-mini cursor-pointer items-center justify-center rounded-item border text-label transition-colors hover:ring-2 hover:ring-ring ${colorClass}`}
                >
                  {format(day, "d")}
                  <div className="absolute bottom-target hidden w-max rounded-control border border-island-border bg-material-liquid px-item py-micro text-label text-text-primary shadow-premium backdrop-blur-2xl group-hover/day:flex">
                    {jobCount} {jobCount !== 1 ? "Jobs" : "Job"}
                  </div>
                </div>
              </div>
            );
          })}

          {trailingDays}
        </div>
      </div>
    </Card>
  );
};

export default JobCalendar;

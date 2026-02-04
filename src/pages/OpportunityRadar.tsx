import React from "react";
import { Badge, Card, Dropdown, EmptyState, IconButton } from "../shared/ui";

const OpportunityRadar: React.FC = () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#141414]">
            Opportunity Radar
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Insights and signals to help you spot new opportunities faster.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown label="Last 30 days">
            <button
              type="button"
              className="w-full rounded-[8px] px-3 py-2 text-left text-xs text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
            >
              Last 7 days
            </button>
            <button
              type="button"
              className="w-full rounded-[8px] px-3 py-2 text-left text-xs text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
            >
              Last 30 days
            </button>
            <button
              type="button"
              className="w-full rounded-[8px] px-3 py-2 text-left text-xs text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
            >
              Last 90 days
            </button>
          </Dropdown>

          <IconButton
            variant="outline"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#575757]"
            >
              <path
                d="M13.3333 7.33333C13.3333 4.75599 11.244 2.66666 8.66667 2.66666C6.98264 2.66666 5.5052 3.54935 4.66667 4.87499M2.66667 8.66666C2.66667 11.244 4.75601 13.3333 7.33334 13.3333C9.01736 13.3333 10.4948 12.4506 11.3333 11.125M4.66667 2.66666V5.33333H2M14 10.6667V13.3333H11.3333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card className="min-h-[160px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#141414]">Signal Summary</p>
            <Badge tone="info">New</Badge>
          </div>
          <p className="text-xs text-[#8A8A8A]">
            Placeholder for top signals and alerts.
          </p>
        </Card>
        <Card className="min-h-[160px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#141414]">Market Pulse</p>
            <Badge tone="neutral">Weekly</Badge>
          </div>
          <p className="text-xs text-[#8A8A8A]">
            Placeholder for trend snapshots.
          </p>
        </Card>
        <Card className="min-h-[160px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#141414]">Opportunities</p>
            <Badge tone="warning">0 Found</Badge>
          </div>
          <EmptyState
            title="No opportunities yet"
            description="Connect a data source or adjust filters to see results."
          />
        </Card>
      </div>
    </div>
);

export default OpportunityRadar;

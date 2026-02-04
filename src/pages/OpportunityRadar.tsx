import React from "react";
import { Card } from "../shared/ui";

const OpportunityRadar: React.FC = () => (
  <div className="flex flex-col gap-5">
    <div>
      <h1 className="text-xl font-semibold text-[#141414]">
        Opportunity Radar
      </h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Insights and signals to help you spot new opportunities faster.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Card className="min-h-[140px]">
        <p className="text-sm font-medium text-[#141414]">Signal Summary</p>
        <p className="mt-2 text-xs text-[#8A8A8A]">
          Placeholder for top signals and alerts.
        </p>
      </Card>
      <Card className="min-h-[140px]">
        <p className="text-sm font-medium text-[#141414]">Market Pulse</p>
        <p className="mt-2 text-xs text-[#8A8A8A]">
          Placeholder for trend snapshots.
        </p>
      </Card>
      <Card className="min-h-[140px]">
        <p className="text-sm font-medium text-[#141414]">Opportunities</p>
        <p className="mt-2 text-xs text-[#8A8A8A]">
          Placeholder for shortlisted opportunities.
        </p>
      </Card>
    </div>
  </div>
);

export default OpportunityRadar;

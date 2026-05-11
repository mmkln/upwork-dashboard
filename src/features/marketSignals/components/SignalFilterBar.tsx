import React from "react";
import { Button, Card, Input, Select } from "../../../shared/ui";
import type { MarketSignalFilters, RelevanceStatus } from "../types";

type SignalFilterBarProps = {
  filters: MarketSignalFilters;
  requestCategories: string[];
  clientTypes: string[];
  buyerNeeds: string[];
  skills: string[];
  tools: string[];
  onChange: (filters: MarketSignalFilters) => void;
};

const relevanceOptions: Array<RelevanceStatus | "All"> = [
  "All",
  "Relevant",
  "Maybe Relevant",
  "Irrelevant",
];

const scoreOptions = [0, 3, 4, 5];

const optionList = (values: string[]) => ["All", ...values];

const SignalFilterBar: React.FC<SignalFilterBarProps> = ({
  filters,
  requestCategories,
  clientTypes,
  buyerNeeds,
  skills,
  tools,
  onChange,
}) => {
  const patchFilters = (patch: Partial<MarketSignalFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1.5fr)_repeat(7,minmax(140px,1fr))_auto]">
        <Input
          value={filters.keyword}
          onChange={(event) => patchFilters({ keyword: event.target.value })}
          placeholder="Search signals"
        />
        <Select
          value={filters.relevanceStatus}
          onChange={(event) =>
            patchFilters({
              relevanceStatus: event.target.value as RelevanceStatus | "All",
            })
          }
        >
          {relevanceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.requestCategory}
          onChange={(event) =>
            patchFilters({ requestCategory: event.target.value })
          }
        >
          {optionList(requestCategories).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.clientType}
          onChange={(event) => patchFilters({ clientType: event.target.value })}
        >
          {optionList(clientTypes).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.buyerNeed}
          onChange={(event) => patchFilters({ buyerNeed: event.target.value })}
        >
          {optionList(buyerNeeds).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.requiredSkill}
          onChange={(event) =>
            patchFilters({ requiredSkill: event.target.value })
          }
        >
          {optionList(skills).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.relatedTool}
          onChange={(event) => patchFilters({ relatedTool: event.target.value })}
        >
          {optionList(tools).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={filters.minimumScore}
          onChange={(event) =>
            patchFilters({ minimumScore: Number(event.target.value) })
          }
        >
          {scoreOptions.map((option) => (
            <option key={option} value={option}>
              {option ? `Score ${option}+` : "Any score"}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          variant="soft"
          onClick={() =>
            onChange({
              keyword: "",
              relevanceStatus: "All",
              requestCategory: "All",
              clientType: "All",
              buyerNeed: "All",
              requiredSkill: "All",
              relatedTool: "All",
              minimumScore: 0,
            })
          }
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default SignalFilterBar;

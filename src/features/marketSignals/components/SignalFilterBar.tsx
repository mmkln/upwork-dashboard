import React from "react";
import { Button, ContentToolbar, Input, Select } from "../../../shared/ui";
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

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

const FilterField: React.FC<FilterFieldProps> = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-item">
    <span className="text-label text-text-muted">{label}</span>
    {children}
  </label>
);

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
    <ContentToolbar>
      <div className="flex flex-col gap-micro">
        <p className="text-ui text-text-primary">Filters</p>
      </div>
      <div className="grid grid-cols-1 gap-control lg:grid-cols-signal-filters">
        <FilterField label="Keyword">
          <Input
            value={filters.keyword}
            onChange={(event) => patchFilters({ keyword: event.target.value })}
            placeholder="Search signals"
          />
        </FilterField>
        <FilterField label="Relevance">
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
        </FilterField>
        <FilterField label="Request category">
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
        </FilterField>
        <FilterField label="Client type">
          <Select
            value={filters.clientType}
            onChange={(event) =>
              patchFilters({ clientType: event.target.value })
            }
          >
            {optionList(clientTypes).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Buyer need">
          <Select
            value={filters.buyerNeed}
            onChange={(event) =>
              patchFilters({ buyerNeed: event.target.value })
            }
          >
            {optionList(buyerNeeds).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Required skill">
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
        </FilterField>
        <FilterField label="Related tool">
          <Select
            value={filters.relatedTool}
            onChange={(event) =>
              patchFilters({ relatedTool: event.target.value })
            }
          >
            {optionList(tools).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Minimum score">
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
        </FilterField>
        <Button
          className="self-end"
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
    </ContentToolbar>
  );
};

export default SignalFilterBar;

export type MarketResearch = {
  id: string;
  owner: number;
  title: string;
  description: string;
  jobs_snapshot: string[];
  created_at: string;
  updated_at: string;
};

export type MarketResearchPayload = Pick<
  MarketResearch,
  "title" | "description" | "jobs_snapshot"
>;

export type CreateMarketResearchPayload = MarketResearchPayload;

export type ReplaceMarketResearchPayload = MarketResearchPayload;

export type UpdateMarketResearchPayload = Partial<MarketResearchPayload>;

export type MarketResearchValidationErrors = Partial<
  Record<keyof MarketResearchPayload, string[]>
>;

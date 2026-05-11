# Market Signals Board MVP Contract

## Scope

The MVP is a frontend-only market research layer over existing scraped Upwork jobs.
It does not require backend schema changes.

## Board Config

```ts
type MarketSignalsBoardConfig = {
  id: string;
  name: string;
  goal: string;
  marketQuery: string;
  sourceCollectionId: number | null;
  includeKeywords: string[];
  excludeKeywords: string[];
  createdAt: string;
  updatedAt: string;
};
```

## Signal Job

```ts
type RelevanceStatus = "Relevant" | "Maybe Relevant" | "Irrelevant";

type MarketSignalJob = {
  jobId: string;
  boardId: string;
  sourceJob: PreparedUpworkJob;
  relevanceStatus: RelevanceStatus;
  relevanceScore: number;
  matchedIncludeKeywords: string[];
  matchedExcludeKeywords: string[];
  relevanceReason: string;
  requestCategory: string;
  clientType: string;
  niche: string;
  problem: string;
  exactClientLanguage: string;
  buyerNeed: string;
  budgetSignal: string;
  urgencySignal: string;
  requiredSkills: string[];
  relatedTools: string[];
  difficulty: number;
  speedToValue: number;
  marketSignalScore: number;
  scoreBreakdown: SignalScoreBreakdown;
  patternGroup: string;
  notes: string;
};
```

## Pipeline

```text
PreparedUpworkJob[]
-> source collection filter
-> relevance classification
-> signal field extraction
-> repeatability detection
-> market signal scoring
-> manual override application
-> filtering and UI rendering
```

## Decision Levels

### 1. Algorithm Decides By Default

These fields are mechanical, repeatable, and scalable across 1000+ jobs:

```text
relevanceStatus
matchedIncludeKeywords
matchedExcludeKeywords
relevanceScore
basic requestCategory extraction
basic requiredSkills extraction
basic relatedTools extraction
budgetSignal
client data
country
job type
experience
client spend
client rating
created date
```

The algorithm also calculates aggregate facts:

```text
job count per category
job count per skill
job count per client type
average budget
average score
frequency of repeated patterns
```

### 2. Algorithm Suggests, User Corrects

These fields receive an automatic first pass, but the user must be able to
correct them quickly:

```text
requestCategory
clientType
niche
problem
exactClientLanguage
buyerNeed
urgencySignal
requiredSkills
relatedTools
difficulty
speedToValue
marketSignalScore
patternGroup
```

### 3. User Decides Manually

Strategic decisions are user-owned:

```text
Board Goal
Market Query
Include Keywords
Exclude Keywords
final interpretation of strongest patterns
whether a pattern is actually useful
which buyer segment is worth attention
which market signal matters most
whether score makes sense
what to do with the insight
```

The algorithm may show that a pattern repeats, has higher budget, appears often,
or scores strongly. The user decides whether it matters for the current goal.

## Manual Overrides

Manual edits are stored separately from automatic extraction:

```text
automatic signal + matching override = displayed signal
```

This lets the board recalculate when query or keywords change without losing user corrections.

The displayed signal must retain both layers:

```ts
type MarketSignalJob = {
  auto: AutoMarketSignalSnapshot;
  userCorrections: MarketSignalUserCorrections | null;
  // final displayed fields are auto values with user corrections applied
};
```

Example:

```text
auto.requestCategory = "AI Automation"
userCorrections.requestCategory = "CRM Workflow Fix"
displayed.requestCategory = "CRM Workflow Fix"
```

## Local Storage Keys

```text
marketSignals.boards.v1
marketSignals.activeBoardId.v1
marketSignals.overrides.v1
```

## MVP Done Criteria

- User can edit board query and include/exclude keywords.
- Existing jobs are classified as Relevant, Maybe Relevant, or Irrelevant.
- Relevant jobs expose extracted comparison fields and a 1-5 score.
- User can manually correct extracted fields.
- User can filter jobs and inspect repeated pattern groups.

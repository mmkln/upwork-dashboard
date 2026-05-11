import React, { useMemo, useState } from "react";
import type { JobCollection } from "../../../models";
import { Badge, Button, Card, Input, Select, Textarea } from "../../../shared/ui";
import { parseKeywordInput } from "../relevance";
import type { MarketSignalsBoardConfig } from "../types";

type BoardSettingsProps = {
  boards: MarketSignalsBoardConfig[];
  activeBoard: MarketSignalsBoardConfig;
  collections: JobCollection[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onChangeBoard: (board: MarketSignalsBoardConfig) => void;
};

const formatKeywords = (keywords: string[]) => keywords.join(", ");

const BoardSettings: React.FC<BoardSettingsProps> = ({
  boards,
  activeBoard,
  collections,
  onSelectBoard,
  onCreateBoard,
  onChangeBoard,
}) => {
  const [includeValue, setIncludeValue] = useState(
    formatKeywords(activeBoard.includeKeywords),
  );
  const [excludeValue, setExcludeValue] = useState(
    formatKeywords(activeBoard.excludeKeywords),
  );

  React.useEffect(() => {
    setIncludeValue(formatKeywords(activeBoard.includeKeywords));
    setExcludeValue(formatKeywords(activeBoard.excludeKeywords));
  }, [activeBoard.id, activeBoard.includeKeywords, activeBoard.excludeKeywords]);

  const selectedCollectionValue = useMemo(
    () => String(activeBoard.sourceCollectionId ?? "all"),
    [activeBoard.sourceCollectionId],
  );

  const patchBoard = (patch: Partial<MarketSignalsBoardConfig>) => {
    onChangeBoard({
      ...activeBoard,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const commitIncludeKeywords = () => {
    patchBoard({ includeKeywords: parseKeywordInput(includeValue) });
  };

  const commitExcludeKeywords = () => {
    patchBoard({ excludeKeywords: parseKeywordInput(excludeValue) });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge tone="info">Board rules</Badge>
          <h2 className="mt-3 text-lg font-semibold text-text-primary">
            Board settings
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={activeBoard.id}
            onChange={(event) => onSelectBoard(event.target.value)}
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="soft" onClick={onCreateBoard}>
            New board
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Board name</span>
          <Input
            value={activeBoard.name}
            onChange={(event) => patchBoard({ name: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Board goal</span>
          <Input
            value={activeBoard.goal}
            onChange={(event) => patchBoard({ goal: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Market query</span>
          <Input
            value={activeBoard.marketQuery}
            onChange={(event) =>
              patchBoard({ marketQuery: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">
            Source collection
          </span>
          <Select
            value={selectedCollectionValue}
            onChange={(event) =>
              patchBoard({
                sourceCollectionId:
                  event.target.value === "all"
                    ? null
                    : Number(event.target.value),
              })
            }
          >
            <option value="all">All collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">
            Include keywords
          </span>
          <Textarea
            className="min-h-[78px]"
            value={includeValue}
            onBlur={commitIncludeKeywords}
            onChange={(event) => setIncludeValue(event.target.value)}
            placeholder="gohighlevel, crm, automation"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">
            Exclude keywords
          </span>
          <Textarea
            className="min-h-[78px]"
            value={excludeValue}
            onBlur={commitExcludeKeywords}
            onChange={(event) => setExcludeValue(event.target.value)}
            placeholder="tutorial, course, training"
          />
        </label>
      </div>
    </Card>
  );
};

export default BoardSettings;

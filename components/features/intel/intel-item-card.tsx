import { Card } from "@/components/ui/card";
import { SignalBadge } from "./signal-badge";
import { SourceIcon } from "./source-icon";
import { formatDistanceToNow } from "date-fns";

interface IntelItemCardProps {
  id: string;
  title: string;
  sourcePlatform: string;
  signalType: string;
  createdAt: Date;
  isSelected: boolean;
  onClick: () => void;
}

export function IntelItemCard({
  title,
  sourcePlatform,
  signalType,
  createdAt,
  isSelected,
  onClick,
}: IntelItemCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <SourceIcon platform={sourcePlatform} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <SignalBadge signalType={signalType} />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

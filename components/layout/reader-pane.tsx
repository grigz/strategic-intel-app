"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { sanitizeHTML } from "@/lib/sanitize";
import { SignalBadge } from "@/components/features/intel/signal-badge";
import { SourceIcon } from "@/components/features/intel/source-icon";
import { formatDistanceToNow } from "date-fns";

interface IntelItemDetail {
  id: string;
  title: string;
  rawContent: string;
  sourceUrl: string;
  sourcePlatform: string;
  signalType: string;
  createdAt: Date;
  competitorName?: string;
  keywordTerm?: string;
}

interface ReaderPaneProps {
  itemId: string | null;
}

export function ReaderPane({ itemId }: ReaderPaneProps) {
  const [item, setItem] = useState<IntelItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }

    async function fetchItem() {
      setLoading(true);
      try {
        const response = await fetch(`/api/export?format=json`);
        const data = await response.json();
        const foundItem = data.find((i: IntelItemDetail) => i.id === itemId);
        setItem(foundItem || null);
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [itemId]);

  if (!itemId) {
    return (
      <div className="w-96 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Select an item to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-96 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="w-96 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Item not found</p>
      </div>
    );
  }

  const sanitizedContent = sanitizeHTML(item.rawContent);

  return (
    <div className="w-96 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <SourceIcon platform={item.sourcePlatform} />
          <SignalBadge signalType={item.signalType} />
        </div>
        <h2 className="font-bold text-lg mb-2">{item.title}</h2>
        <p className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
        {item.competitorName && (
          <p className="text-sm text-gray-600 mt-1">Company: {item.competitorName}</p>
        )}
        {item.keywordTerm && (
          <p className="text-sm text-gray-600 mt-1">Keyword: {item.keywordTerm}</p>
        )}
      </div>
      <ScrollArea className="flex-1 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </ScrollArea>
      <div className="p-6 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(item.sourceUrl, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Original
        </Button>
      </div>
    </div>
  );
}

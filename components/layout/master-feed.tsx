"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntelItemCard } from "@/components/features/intel/intel-item-card";

interface IntelItem {
  id: string;
  title: string;
  rawContent: string;
  sourceUrl: string;
  sourcePlatform: string;
  signalType: string;
  createdAt: Date;
  competitorId: string | null;
  keywordId: string | null;
}

interface MasterFeedProps {
  activeView: "companies" | "keywords";
  selectedItemId: string | null;
  onItemSelect: (id: string) => void;
}

export function MasterFeed({ activeView, selectedItemId, onItemSelect }: MasterFeedProps) {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(false);
      try {
        const scope = activeView === "companies" ? "companies" : "keywords";
        const response = await fetch(`/api/export?scope=${scope}&format=json`);
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
          setError(true);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItems([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [activeView]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-gray-700 font-medium mb-2">Database Not Configured</p>
          <p className="text-gray-500 text-sm">
            Please configure your environment variables in <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            See <code className="bg-gray-100 px-1 rounded">QUICKSTART.md</code> for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-gray-700 font-medium mb-2">No Intelligence Items</p>
          <p className="text-gray-500 text-sm">
            Add competitors or keywords, then send webhooks to populate this feed.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            See <code className="bg-gray-100 px-1 rounded">TESTING.md</code> for examples.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          {activeView === "companies" ? "Company Intelligence" : "Keyword Intelligence"}
        </h2>
        <p className="text-sm text-gray-600">{items.length} items</p>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-2">
          {items.map((item) => (
            <IntelItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              sourcePlatform={item.sourcePlatform}
              signalType={item.signalType}
              createdAt={item.createdAt}
              isSelected={selectedItemId === item.id}
              onClick={() => onItemSelect(item.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

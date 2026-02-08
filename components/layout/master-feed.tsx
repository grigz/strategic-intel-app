"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntelItemCard } from "@/components/features/intel/intel-item-card";
import { Download, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  competitorName?: string | null;
  keywordTerm?: string | null;
}

interface MasterFeedProps {
  activeView: "companies" | "keywords";
  selectedItemId: string | null;
  onItemSelect: (id: string) => void;
  onMobileMenuClick: () => void;
}

export function MasterFeed({ activeView, selectedItemId, onItemSelect, onMobileMenuClick }: MasterFeedProps) {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeView]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
  };

  const handleDownload = async (format: "csv" | "json") => {
    try {
      const scope = activeView === "companies" ? "companies" : "keywords";
      const response = await fetch(`/api/export?scope=${scope}&format=${format}`);
      const data = await response.text();

      const blob = new Blob([data], {
        type: format === "csv" ? "text/csv" : "application/json"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${scope}-intelligence-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    }
  };

  // Group items by company or keyword
  const groupedItems = items.reduce((groups, item) => {
    const key = activeView === "companies"
      ? (item.competitorName || "Unknown Company")
      : (item.keywordTerm || "Unknown Keyword");

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, IntelItem[]>);

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuClick}
              className="md:hidden h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold">
              {activeView === "companies" ? "Company Intelligence" : "Keyword Intelligence"}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("csv")}
              className="h-8 px-2"
            >
              <Download className="h-3 w-3 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("json")}
              className="h-8 px-2"
            >
              <Download className="h-3 w-3 mr-1" />
              JSON
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">{items.length} items</p>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-sm text-gray-900">{groupName}</h3>
                <span className="text-xs text-gray-500">{groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <IntelItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    sourceUrl={item.sourceUrl}
                    sourcePlatform={item.sourcePlatform}
                    signalType={item.signalType}
                    createdAt={item.createdAt}
                    isSelected={selectedItemId === item.id}
                    onClick={() => onItemSelect(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

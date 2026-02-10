"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, AlertCircle } from "lucide-react";

interface ManagementDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Competitor {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
}

interface Keyword {
  id: string;
  term: string;
  category: string;
  createdAt: string;
}

interface MonitoredPage {
  id: string;
  name: string;
  url: string;
  competitorId: string | null;
  signalType: string;
  enabled: string;
  lastChecked: string | null;
  createdAt: string;
}

export function ManagementDashboard({ open, onOpenChange }: ManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<"companies" | "keywords" | "webpages">("companies");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [webpages, setWebpages] = useState<MonitoredPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compResp, keyResp, webResp] = await Promise.all([
        fetch("/api/competitors"),
        fetch("/api/keywords"),
        fetch("/api/monitored-pages"),
      ]);
      const [compData, keyData, webData] = await Promise.all([
        compResp.json(),
        keyResp.json(),
        webResp.json(),
      ]);
      setCompetitors(compData);
      setKeywords(keyData);
      setWebpages(webData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleDeleteCompetitor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/competitors?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      alert(`✅ Deleted "${name}"`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete competitor:", error);
      alert(`❌ Failed to delete "${name}". It may be referenced by monitored pages or intel items.`);
    }
  };

  const handleDeleteKeyword = async (id: string, term: string) => {
    if (!confirm(`Are you sure you want to delete keyword "${term}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      alert(`✅ Deleted keyword "${term}"`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete keyword:", error);
      alert(`❌ Failed to delete keyword "${term}". It may be referenced by intel items.`);
    }
  };

  const handleDeleteWebpage = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete monitored page "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/monitored-pages?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      alert(`✅ Deleted monitored page "${name}"`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete webpage:", error);
      alert(`❌ Failed to delete "${name}"`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Data</DialogTitle>
          <DialogDescription>
            View and delete companies, keywords, and monitored webpages.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("companies")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "companies"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Companies ({competitors.length})
          </button>
          <button
            onClick={() => setActiveTab("keywords")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "keywords"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Keywords ({keywords.length})
          </button>
          <button
            onClick={() => setActiveTab("webpages")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "webpages"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Webpages ({webpages.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            {/* Companies Tab */}
            {activeTab === "companies" && (
              <div className="space-y-2 py-4">
                {competitors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No companies added yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {competitors.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-semibold">{comp.name}</h3>
                          <p className="text-sm text-gray-600">{comp.domain}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Added: {new Date(comp.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCompetitor(comp.id, comp.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === "keywords" && (
              <div className="space-y-2 py-4">
                {keywords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No keywords added yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {keywords.map((kw) => (
                      <div
                        key={kw.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-semibold">{kw.term}</h3>
                          <p className="text-sm text-gray-600">Category: {kw.category}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Added: {new Date(kw.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteKeyword(kw.id, kw.term)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Webpages Tab */}
            {activeTab === "webpages" && (
              <div className="space-y-2 py-4">
                {webpages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No monitored webpages added yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {webpages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{page.name}</h3>
                          <p className="text-sm text-gray-600 break-all">{page.url}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>Signal: {page.signalType}</span>
                            <span>Status: {page.enabled === "true" ? "Enabled" : "Disabled"}</span>
                            {page.lastChecked && (
                              <span>Last checked: {new Date(page.lastChecked).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWebpage(page.id, page.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="border-t pt-4 flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Deleting items may fail if they're referenced by intelligence items.
            Delete the associated intel items first, or use the Supabase dashboard for forced deletion.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MonitoredPage {
  id: string;
  url: string;
  name: string;
  competitorId: string | null;
  signalType: string;
  lastHash: string | null;
  lastChecked: string | null;
  enabled: string;
  createdAt: string;
}

interface MonitoringDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonitoringDashboard({ open, onOpenChange }: MonitoringDashboardProps) {
  const [pages, setPages] = useState<MonitoredPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/monitored-pages");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Failed to fetch monitored pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPages();
    }
  }, [open]);

  const handleToggleEnabled = async (page: MonitoredPage) => {
    try {
      const newEnabled = page.enabled === "true" ? "false" : "true";
      await fetch("/api/monitored-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: page.id,
          enabled: newEnabled,
        }),
      });
      fetchPages();
    } catch (error) {
      console.error("Failed to toggle page:", error);
      alert("Failed to toggle page");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monitored page?")) return;

    try {
      await fetch(`/api/monitored-pages?id=${id}`, {
        method: "DELETE",
      });
      fetchPages();
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Failed to delete page");
    }
  };

  const handleCheckNow = () => {
    alert(
      "To check pages now, go to:\n\n" +
      "https://github.com/grigz/strategic-intel-app/actions/workflows/monitor-pages.yml\n\n" +
      "Click 'Run workflow' to trigger an immediate check."
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monitoring Dashboard</DialogTitle>
          <DialogDescription>
            Manage monitored pages. GitHub Actions checks these every 6 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {pages.length} {pages.length === 1 ? 'page' : 'pages'} monitored
            </p>
            <Button variant="outline" size="sm" onClick={handleCheckNow}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Check Now (via GitHub Actions)
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No monitored pages yet. Add one from Settings!
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`border rounded-lg p-4 ${
                    page.enabled === "false" ? "bg-gray-50 opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{page.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {page.signalType}
                        </Badge>
                        {page.enabled === "false" && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{page.url}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {page.lastChecked
                            ? `Checked ${formatDistanceToNow(new Date(page.lastChecked), {
                                addSuffix: true,
                              })}`
                            : "Never checked"}
                        </span>
                        {page.lastHash && (
                          <span className="font-mono">Hash: {page.lastHash.substring(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleEnabled(page)}
                        title={page.enabled === "true" ? "Disable" : "Enable"}
                      >
                        {page.enabled === "true" ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

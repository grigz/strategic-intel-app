"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddMonitoredPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMonitoredPageDialog({ open, onOpenChange, onSuccess }: AddMonitoredPageDialogProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [competitorId, setCompetitorId] = useState("");
  const [signalType, setSignalType] = useState("Product Launch");
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCompetitors() {
      try {
        const response = await fetch("/api/competitors");
        const data = await response.json();
        setCompetitors(data);
      } catch (error) {
        console.error("Failed to fetch competitors:", error);
      }
    }
    if (open) {
      fetchCompetitors();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/monitored-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          name,
          competitorId: competitorId || null,
          signalType,
        }),
      });

      if (!response.ok) throw new Error("Failed to add monitored page");

      setUrl("");
      setName("");
      setCompetitorId("");
      setSignalType("Product Launch");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add monitored page:", error);
      alert("Failed to add monitored page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Monitored Page</DialogTitle>
          <DialogDescription>
            Add a page to monitor for changes. GitHub Actions will check it periodically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Page URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com/blog"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Page Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Company Blog"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor">Competitor (Optional)</Label>
              <select
                id="competitor"
                value={competitorId}
                onChange={(e) => setCompetitorId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">No specific competitor</option>
                {competitors.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signalType">Signal Type</Label>
              <select
                id="signalType"
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="Product Launch">Product Launch</option>
                <option value="Market Shift">Market Shift</option>
                <option value="Hiring">Hiring</option>
                <option value="Culture">Culture</option>
                <option value="Customer Pain">Customer Pain</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

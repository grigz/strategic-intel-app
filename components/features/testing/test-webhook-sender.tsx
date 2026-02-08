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
import { Textarea } from "@/components/ui/textarea";

interface TestWebhookSenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TestWebhookSender({ open, onOpenChange, onSuccess }: TestWebhookSenderProps) {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Form state
  const [targetType, setTargetType] = useState<"company" | "keyword">("company");
  const [competitorId, setCompetitorId] = useState("");
  const [keywordId, setKeywordId] = useState("");
  const [signalType, setSignalType] = useState("Product Launch");
  const [platform, setPlatform] = useState("Website");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [compResp, keyResp] = await Promise.all([
          fetch("/api/competitors"),
          fetch("/api/keywords"),
        ]);
        const [compData, keyData] = await Promise.all([
          compResp.json(),
          keyResp.json(),
        ]);
        setCompetitors(compData);
        setKeywords(keyData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // Build query params
      const params = new URLSearchParams({
        type: signalType,
        platform: platform,
      });

      if (targetType === "company" && competitorId) {
        params.append("comp_id", competitorId);
      } else if (targetType === "keyword" && keywordId) {
        params.append("keyword_id", keywordId);
      }

      // Send webhook
      const response = await fetch(`/api/webhooks/ingest?${params.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer dev-secret-token-change-in-production",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          url,
        }),
      });

      if (!response.ok) throw new Error("Webhook failed");

      const result = await response.json();

      // Reset form
      setTitle("");
      setContent("");
      setUrl("");

      alert("✅ Webhook sent successfully! Check your feed in a few seconds.");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send webhook:", error);
      alert("❌ Failed to send webhook. Check console for details.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Webhook Sender</DialogTitle>
          <DialogDescription>
            Send a test webhook to create intelligence items without external tools.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSend}>
            <div className="space-y-4 py-4">
              {/* Target Type */}
              <div className="space-y-2">
                <Label>Target Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="targetType"
                      value="company"
                      checked={targetType === "company"}
                      onChange={(e) => setTargetType(e.target.value as "company")}
                    />
                    <span>Company</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="targetType"
                      value="keyword"
                      checked={targetType === "keyword"}
                      onChange={(e) => setTargetType(e.target.value as "keyword")}
                    />
                    <span>Keyword</span>
                  </label>
                </div>
              </div>

              {/* Competitor/Keyword Selection */}
              {targetType === "company" ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="keyword">Keyword (Optional)</Label>
                  <select
                    id="keyword"
                    value={keywordId}
                    onChange={(e) => setKeywordId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">No specific keyword</option>
                    {keywords.map((kw) => (
                      <option key={kw.id} value={kw.id}>
                        {kw.term} ({kw.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Signal Type */}
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

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Source Platform</Label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="Website">Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Test Intelligence Item"
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML allowed)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>This is a test intelligence item created via the webhook sender.</p>"
                  rows={4}
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Source URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/test"
                  type="url"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Webhook"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

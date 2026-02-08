"use client";

import { useState } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MasterFeed } from "@/components/layout/master-feed";
import { ReaderPane } from "@/components/layout/reader-pane";
import { AddCompetitorDialog } from "@/components/features/competitors/add-competitor-dialog";
import { AddKeywordDialog } from "@/components/features/keywords/add-keyword-dialog";
import { AddMonitoredPageDialog } from "@/components/features/monitoring/add-monitored-page-dialog";

export default function Home() {
  const [activeView, setActiveView] = useState<"companies" | "keywords">("companies");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [showAddMonitoredPage, setShowAddMonitoredPage] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSelectedItemId(null);
        }}
        onSettingsClick={() => setShowSettings(!showSettings)}
      />
      <MasterFeed
        activeView={activeView}
        selectedItemId={selectedItemId}
        onItemSelect={setSelectedItemId}
      />
      <ReaderPane itemId={selectedItemId} />

      <AddCompetitorDialog
        open={showAddCompetitor}
        onOpenChange={setShowAddCompetitor}
        onSuccess={() => {
          // Refresh the feed
          setSelectedItemId(null);
        }}
      />
      <AddKeywordDialog
        open={showAddKeyword}
        onOpenChange={setShowAddKeyword}
        onSuccess={() => {
          // Refresh the feed
          setSelectedItemId(null);
        }}
      />
      <AddMonitoredPageDialog
        open={showAddMonitoredPage}
        onOpenChange={setShowAddMonitoredPage}
        onSuccess={() => {
          // Refresh the feed
          setSelectedItemId(null);
        }}
      />

      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <button
                className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => {
                  setShowAddCompetitor(true);
                  setShowSettings(false);
                }}
              >
                <h3 className="font-semibold">Add Competitor</h3>
                <p className="text-sm text-gray-600">Track a new competitor</p>
              </button>
              <button
                className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => {
                  setShowAddKeyword(true);
                  setShowSettings(false);
                }}
              >
                <h3 className="font-semibold">Add Keyword</h3>
                <p className="text-sm text-gray-600">Track a new keyword</p>
              </button>
              <button
                className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => {
                  setShowAddMonitoredPage(true);
                  setShowSettings(false);
                }}
              >
                <h3 className="font-semibold">Add Monitored Page</h3>
                <p className="text-sm text-gray-600">Monitor a webpage for changes</p>
              </button>
            </div>
            <button
              className="mt-4 w-full p-2 border rounded-lg hover:bg-gray-50"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

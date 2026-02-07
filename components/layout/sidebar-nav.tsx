"use client";

import { Button } from "@/components/ui/button";
import { Building2, Hash, Settings } from "lucide-react";

interface SidebarNavProps {
  activeView: "companies" | "keywords";
  onViewChange: (view: "companies" | "keywords") => void;
  onSettingsClick: () => void;
}

export function SidebarNav({ activeView, onViewChange, onSettingsClick }: SidebarNavProps) {
  return (
    <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Strategic Intel</h1>
        <p className="text-sm text-gray-600">Market Sensing Platform</p>
      </div>

      <div className="space-y-2 flex-1">
        <Button
          variant={activeView === "companies" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("companies")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Companies
        </Button>
        <Button
          variant={activeView === "keywords" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("keywords")}
        >
          <Hash className="mr-2 h-4 w-4" />
          Keywords
        </Button>
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}

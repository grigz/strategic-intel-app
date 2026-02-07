import { Globe, Linkedin, Twitter } from "lucide-react";

interface SourceIconProps {
  platform: string;
  className?: string;
}

export function SourceIcon({ platform, className = "w-4 h-4" }: SourceIconProps) {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin className={className} />;
    case "x":
    case "twitter":
      return <Twitter className={className} />;
    case "reddit":
      // Using Globe as fallback since lucide doesn't have Reddit
      return <Globe className={className} />;
    case "website":
    default:
      return <Globe className={className} />;
  }
}

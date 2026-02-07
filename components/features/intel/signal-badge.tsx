import { Badge } from "@/components/ui/badge";

interface SignalBadgeProps {
  signalType: string;
}

const signalColors: Record<string, string> = {
  Hiring: "bg-green-100 text-green-800 hover:bg-green-100",
  "Market Shift": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Culture: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "Customer Pain": "bg-red-100 text-red-800 hover:bg-red-100",
};

export function SignalBadge({ signalType }: SignalBadgeProps) {
  const colorClass = signalColors[signalType] || "bg-gray-100 text-gray-800";

  return (
    <Badge className={colorClass} variant="secondary">
      {signalType}
    </Badge>
  );
}

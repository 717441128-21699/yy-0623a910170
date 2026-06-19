import { AlertTriangle, Lightbulb, Info } from "lucide-react";
import type { CarWarning } from "@/types";
import { cn } from "@/lib/utils";

interface WarningBarProps {
  warnings: CarWarning[];
}

const iconMap = {
  conflict: AlertTriangle,
  suggestion: Lightbulb,
  info: Info,
};

const colorMap = {
  conflict: "border-l-red-500 text-red-400",
  suggestion: "border-l-yellow-500 text-yellow-400",
  info: "border-l-blue-400 text-blue-300",
};

export default function WarningBar({ warnings }: WarningBarProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {warnings.map((w, i) => {
        const Icon = iconMap[w.type];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 border-l-2 px-2 py-1 text-xs",
              colorMap[w.type]
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{w.message}</span>
          </div>
        );
      })}
    </div>
  );
}

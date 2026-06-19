import { Pencil, Trash2 } from "lucide-react";
import type { Player, Experience } from "@/types";
import { cn } from "@/lib/utils";

const EXP_STYLES: Record<Experience, string> = {
  新手: "bg-green-500/20 text-green-400",
  进阶: "bg-blue-500/20 text-blue-400",
  老手: "bg-purple-500/20 text-purple-400",
};

const PREF_LABELS: { key: keyof Player["preferences"]; label: string; color: string }[] = [
  { key: "logicLevel", label: "推理", color: "bg-blue-400" },
  { key: "emotionLevel", label: "情感", color: "bg-pink-400" },
  { key: "horrorTolerance", label: "灵异", color: "bg-red-400" },
  { key: "mechanicPreference", label: "机制", color: "bg-orange-400" },
];

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export default function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <div className="rounded-xl bg-[#1a1f2e] border border-white/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{player.name}</span>
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium",
              EXP_STYLES[player.experience]
            )}
          >
            {player.experience}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(player)}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {PREF_LABELS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-[#9ca3af] w-6 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={cn("h-full rounded-full", color)}
                style={{ width: `${(player.preferences[key] / 10) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#9ca3af] w-4 text-right">
              {player.preferences[key]}
            </span>
          </div>
        ))}
      </div>

      {player.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {player.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4a44c]/15 text-[#d4a44c]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {player.dealbreakers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {player.dealbreakers.map((db) => (
            <span
              key={db}
              className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400"
            >
              🚫 {db}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

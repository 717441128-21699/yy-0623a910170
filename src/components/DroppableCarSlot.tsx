import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { X, ChevronDown, ChevronUp, Lightbulb, ArrowRight } from "lucide-react";
import type { Car, CarWarning, Player, Script } from "@/types";
import type { ScriptSuggestion } from "@/utils/matching";
import { getDirectionalSuggestions } from "@/utils/matching";
import { cn } from "@/lib/utils";
import DraggablePlayerCard from "./DraggablePlayerCard";
import WarningBar from "./WarningBar";

interface DroppableCarSlotProps {
  car: Car;
  script: Script;
  players: Player[];
  warnings: CarWarning[];
  suggestions: ScriptSuggestion[];
  onRemoveCar: (carId: string) => void;
  onUnassignPlayer: (playerId: string) => void;
  onSwapScript: (carId: string, newScriptId: string) => void;
}

export default function DroppableCarSlot({
  car,
  script,
  players,
  warnings,
  suggestions,
  onRemoveCar,
  onUnassignPlayer,
  onSwapScript,
}: DroppableCarSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `car-${car.id}`,
    data: { car },
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const maxPlayers = script.playerRange[1];
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const hasConflicts = warnings.some((w) => w.type === "conflict");

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl bg-[#1a1f2e] overflow-hidden transition-all duration-200",
        isOver && "ring-2 ring-[#d4a44c]/70 bg-[#1a1f2e]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{script.name}</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-medium",
              getTypeBadgeClass(script.type)
            )}
          >
            {script.type}
          </span>
          <span className="text-[10px] text-[#9ca3af]/70">
            {players.length}/{script.playerRange[1]}人
          </span>
          {hasConflicts && (
            <span className="flex items-center gap-1 text-[10px] text-red-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              有冲突
            </span>
          )}
        </div>
        <button
          onClick={() => onRemoveCar(car.id)}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#9ca3af]/50 hover:text-red-400 transition-colors rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        {players.map((player) => (
          <div key={player.id} className="relative group">
            <DraggablePlayerCard player={player} />
            <button
              onClick={() => onUnassignPlayer(player.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md text-[#9ca3af]/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={cn(
              "min-h-[44px] flex items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              isOver
                ? "border-[#d4a44c]/50 bg-[#d4a44c]/5"
                : "border-white/10"
            )}
          >
            <span
              className={cn(
                "text-xs",
                isOver ? "text-[#d4a44c]" : "text-white/20"
              )}
            >
              拖入玩家
            </span>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="px-3 pb-2">
          <WarningBar warnings={warnings} />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setShowSuggestions((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#d4a44c] hover:bg-[#d4a44c]/5 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>换本方向推荐 ({suggestions.length})</span>
            </div>
            {showSuggestions ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showSuggestions && (
            <div className="px-3 pb-3 space-y-1.5 animate-slide-up">
              {suggestions.map((sug) => (
                <div
                  key={sug.script.id}
                  className="rounded-lg border bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          sug.directionColor
                        )}
                      >
                        {sug.direction}
                      </span>
                      <span className="text-xs font-medium text-white">
                        {sug.script.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onSwapScript(car.id, sug.script.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#d4a44c] bg-[#d4a44c]/10 hover:bg-[#d4a44c]/20 transition-colors"
                    >
                      换本
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {sug.reasons.map((r, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-[#9ca3af] flex items-start gap-1"
                      >
                        <span className="text-green-400 mt-0.5">·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTypeBadgeClass(type: string) {
  const map: Record<string, string> = {
    本格: "bg-blue-500/20 text-blue-400",
    变格: "bg-purple-500/20 text-purple-400",
    社会派: "bg-emerald-500/20 text-emerald-400",
    情感: "bg-pink-500/20 text-pink-400",
    机制: "bg-orange-500/20 text-orange-400",
    恐怖: "bg-red-500/20 text-red-400",
  };
  return map[type] || "bg-gray-500/20 text-gray-400";
}

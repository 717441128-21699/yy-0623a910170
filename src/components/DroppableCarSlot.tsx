import { useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";
import type { Car, CarWarning, Player, Script } from "@/types";
import { cn } from "@/lib/utils";
import DraggablePlayerCard from "./DraggablePlayerCard";
import WarningBar from "./WarningBar";

interface DroppableCarSlotProps {
  car: Car;
  script: Script;
  players: Player[];
  warnings: CarWarning[];
  onRemoveCar: (carId: string) => void;
  onUnassignPlayer: (playerId: string) => void;
}

export default function DroppableCarSlot({
  car,
  script,
  players,
  warnings,
  onRemoveCar,
  onUnassignPlayer,
}: DroppableCarSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `car-${car.id}`,
    data: { car },
  });

  const maxPlayers = script.playerRange[1];
  const emptySlots = Math.max(0, maxPlayers - players.length);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl bg-[#1a1f2e] p-3 transition-colors",
        isOver && "ring-2 ring-[#d4a44c]/60 bg-[#1a1f2e]/90"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{script.name}</span>
          <span className="rounded bg-[#d4a44c]/20 text-[#d4a44c] px-1.5 py-0.5 text-[10px] font-medium">
            {script.type}
          </span>
          <span className="text-[10px] text-gray-500">
            {script.playerRange[0]}-{script.playerRange[1]}人
          </span>
        </div>
        <button
          onClick={() => onRemoveCar(car.id)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {players.map((player) => (
          <div key={player.id} className="relative group">
            <DraggablePlayerCard player={player} />
            <button
              onClick={() => onUnassignPlayer(player.id)}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[44px] flex items-center justify-center rounded-lg border-2 border-dashed border-gray-700 text-gray-600 text-xs"
          >
            拖入玩家
          </div>
        ))}
      </div>

      <WarningBar warnings={warnings} />
    </div>
  );
}

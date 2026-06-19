import { useDraggable } from "@dnd-kit/core";
import type { Player } from "@/types";
import { cn } from "@/lib/utils";

interface DraggablePlayerCardProps {
  player: Player;
}

const expBadgeColor: Record<string, string> = {
  新手: "bg-green-600/30 text-green-400",
  进阶: "bg-blue-600/30 text-blue-400",
  老手: "bg-purple-600/30 text-purple-400",
};

export default function DraggablePlayerCard({ player }: DraggablePlayerCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { player },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "min-h-[44px] flex items-center gap-2 rounded-lg bg-[#1a1f2e] px-3 py-2.5 cursor-grab active:cursor-grabbing select-none touch-none",
        isDragging && "border-l-3 border-l-[#d4a44c] opacity-90 shadow-lg shadow-[#d4a44c]/20"
      )}
    >
      <span className="text-sm font-medium text-white truncate">{player.name}</span>
      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
          expBadgeColor[player.experience] ?? "bg-gray-600/30 text-gray-400"
        )}
      >
        {player.experience}
      </span>
      <div className="flex gap-1 ml-auto shrink-0">
        {player.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded bg-[#d4a44c]/15 text-[#d4a44c] px-1.5 py-0.5 text-[10px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

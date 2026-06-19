import type { Script, ScriptType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<ScriptType, string> = {
  本格: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  变格: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  社会派: "bg-green-500/20 text-green-400 border-green-500/30",
  情感: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  机制: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  恐怖: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface ScriptCardProps {
  script: Script;
  selected: boolean;
  onToggle: () => void;
}

export default function ScriptCard({ script, selected, onToggle }: ScriptCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "shrink-0 w-56 text-left rounded-xl border-2 p-4 transition-all",
        "bg-[#1a1f2e] hover:bg-[#232840]",
        selected
          ? "border-[#d4a44c] shadow-lg shadow-[#d4a44c]/10"
          : "border-transparent"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-semibold truncate">{script.name}</span>
        <span
          className={cn(
            "shrink-0 text-xs px-2 py-0.5 rounded-full border",
            TYPE_COLORS[script.type]
          )}
        >
          {script.type}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#9ca3af] mb-2">
        <span>{script.playerRange[0]}-{script.playerRange[1]}人</span>
        <span>{script.duration}h</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {script.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#9ca3af]"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-xs text-[#9ca3af] line-clamp-2">{script.description}</p>

      {selected && (
        <div className="mt-2 text-xs text-[#d4a44c] font-medium">✓ 已选择</div>
      )}
    </button>
  );
}

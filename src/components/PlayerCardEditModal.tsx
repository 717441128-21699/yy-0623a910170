import { useState } from "react";
import type { Player, Experience, Dealbreaker } from "@/types";
import { ALL_DEALBREAKERS } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPERIENCES: Experience[] = ["新手", "进阶", "老手"];

const SLIDER_CONFIG = [
  { key: "logicLevel" as const, label: "推理强度" },
  { key: "emotionLevel" as const, label: "情感沉浸" },
  { key: "horrorTolerance" as const, label: "灵异接受度" },
  { key: "mechanicPreference" as const, label: "机制偏好" },
];

interface PlayerCardEditModalProps {
  player: Player;
  onSave: (id: string, data: Partial<Player>) => void;
  onClose: () => void;
}

export default function PlayerCardEditModal({
  player,
  onSave,
  onClose,
}: PlayerCardEditModalProps) {
  const [name, setName] = useState(player.name);
  const [experience, setExperience] = useState<Experience>(player.experience);
  const [preferences, setPreferences] = useState(player.preferences);
  const [dealbreakers, setDealbreakers] = useState<Dealbreaker[]>(player.dealbreakers);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(player.id, {
      name: name.trim(),
      experience,
      preferences,
      dealbreakers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1f2e] border border-white/10 p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">编辑玩家</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-1">玩家姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-[#0f0f1a] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#d4a44c]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">游戏经验</label>
            <div className="flex gap-2">
              {EXPERIENCES.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExperience(exp)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                    experience === exp
                      ? "bg-[#d4a44c] text-black"
                      : "bg-[#0f0f1a] text-[#9ca3af] border border-white/10"
                  )}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#9ca3af]">偏好设置</label>
            {SLIDER_CONFIG.map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#9ca3af]">{label}</span>
                  <span className="text-[#d4a44c] font-medium">{preferences[key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={preferences[key]}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[#d4a44c] cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d4a44c] [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#d4a44c] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">雷区</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DEALBREAKERS.map((db) => (
                <button
                  key={db}
                  type="button"
                  onClick={() =>
                    setDealbreakers((prev) =>
                      prev.includes(db) ? prev.filter((d) => d !== db) : [...prev, db]
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    dealbreakers.includes(db)
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-white/5 text-[#9ca3af] border border-white/10"
                  )}
                >
                  {db}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#9ca3af] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-[#d4a44c] text-black text-sm font-semibold hover:bg-[#d4a44c]/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { Experience, Dealbreaker } from "@/types";
import { ALL_DEALBREAKERS } from "@/types";
import { cn } from "@/lib/utils";

const EXPERIENCES: Experience[] = ["新手", "进阶", "老手"];

const SLIDER_CONFIG = [
  { key: "logicLevel", label: "推理强度" },
  { key: "emotionLevel", label: "情感沉浸" },
  { key: "horrorTolerance", label: "灵异接受度" },
  { key: "mechanicPreference", label: "机制偏好" },
] as const;

interface PlayerFormProps {
  onSubmit: (data: {
    name: string;
    experience: Experience;
    preferences: Record<string, number>;
    dealbreakers: Dealbreaker[];
  }) => void;
}

export default function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<Experience>("新手");
  const [preferences, setPreferences] = useState<Record<string, number>>({
    logicLevel: 5,
    emotionLevel: 5,
    horrorTolerance: 5,
    mechanicPreference: 5,
  });
  const [dealbreakers, setDealbreakers] = useState<Dealbreaker[]>([]);

  const handleSliderChange = (key: string, value: number) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDealbreaker = (db: Dealbreaker) => {
    setDealbreakers((prev) =>
      prev.includes(db) ? prev.filter((d) => d !== db) : [...prev, db]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), experience, preferences, dealbreakers });
    setName("");
    setExperience("新手");
    setPreferences({
      logicLevel: 5,
      emotionLevel: 5,
      horrorTolerance: 5,
      mechanicPreference: 5,
    });
    setDealbreakers([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">
          玩家姓名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入姓名"
          className="w-full rounded-lg bg-[#1a1f2e] border border-white/10 px-3 py-2 text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#d4a44c]/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-2">
          游戏经验
        </label>
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
                  : "bg-[#1a1f2e] text-[#9ca3af] border border-white/10 hover:border-white/20"
              )}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-[#9ca3af]">
          偏好设置
        </label>
        {SLIDER_CONFIG.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#9ca3af]">{label}</span>
              <span className="text-[#d4a44c] font-medium">
                {preferences[key]}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={preferences[key]}
              onChange={(e) => handleSliderChange(key, Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[#d4a44c] cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d4a44c] [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#d4a44c] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9ca3af]/50 mt-0.5">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-2">
          雷区（不接受的元素）
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_DEALBREAKERS.map((db) => (
            <button
              key={db}
              type="button"
              onClick={() => toggleDealbreaker(db)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                dealbreakers.includes(db)
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-white/5 text-[#9ca3af] border border-white/10 hover:border-white/20"
              )}
            >
              {db}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-3 rounded-lg bg-[#d4a44c] text-black font-semibold text-sm transition-colors hover:bg-[#d4a44c]/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        录入玩家
      </button>
    </form>
  );
}

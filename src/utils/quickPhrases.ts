import type { Experience, PlayerPreferences, Dealbreaker } from "@/types";

export interface QuickPhrase {
  id: string;
  label: string;
  emoji: string;
  category: "偏好" | "雷点" | "经验";
  apply: (prefs: PlayerPreferences, dealbreakers: Dealbreaker[], exp: Experience) => {
    preferences: PlayerPreferences;
    dealbreakers: Dealbreaker[];
    experience: Experience;
  };
  remove: (prefs: PlayerPreferences, dealbreakers: Dealbreaker[], exp: Experience) => {
    preferences: PlayerPreferences;
    dealbreakers: Dealbreaker[];
    experience: Experience;
  };
}

export const QUICK_PHRASES: QuickPhrase[] = [
  {
    id: "want-solve",
    label: "想破案",
    emoji: "🔍",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, logicLevel: Math.min(10, prefs.logicLevel + 4) },
      dealbreakers: dbs.filter((d) => d !== "硬核推理"),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, logicLevel: Math.max(0, prefs.logicLevel - 4) },
      dealbreakers: dbs,
      experience: exp,
    }),
  },
  {
    id: "afraid-scary",
    label: "怕吓",
    emoji: "😱",
    category: "雷点",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.max(0, prefs.horrorTolerance - 5) },
      dealbreakers: Array.from(new Set([...dbs, "恐怖元素", "灵异设定"])),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.min(10, prefs.horrorTolerance + 5) },
      dealbreakers: dbs.filter((d) => d !== "恐怖元素" && d !== "灵异设定"),
      experience: exp,
    }),
  },
  {
    id: "afraid-boring",
    label: "怕坐牢",
    emoji: "😴",
    category: "雷点",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, logicLevel: Math.max(0, prefs.logicLevel - 2) },
      dealbreakers: Array.from(new Set([...dbs, "长时间坐牢", "硬核推理"])),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, logicLevel: Math.min(10, prefs.logicLevel + 2) },
      dealbreakers: dbs.filter((d) => d !== "长时间坐牢" && d !== "硬核推理"),
      experience: exp,
    }),
  },
  {
    id: "want-interact",
    label: "想互动",
    emoji: "💬",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: {
        ...prefs,
        emotionLevel: Math.min(10, prefs.emotionLevel + 3),
        mechanicPreference: Math.min(10, prefs.mechanicPreference + 3),
      },
      dealbreakers: dbs.filter((d) => d !== "CP互动"),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: {
        ...prefs,
        emotionLevel: Math.max(0, prefs.emotionLevel - 3),
        mechanicPreference: Math.max(0, prefs.mechanicPreference - 3),
      },
      dealbreakers: dbs,
      experience: exp,
    }),
  },
  {
    id: "crybaby",
    label: "爱哭包",
    emoji: "😭",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, emotionLevel: Math.min(10, prefs.emotionLevel + 5) },
      dealbreakers: dbs.filter((d) => d !== "情感沉浸"),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, emotionLevel: Math.max(0, prefs.emotionLevel - 5) },
      dealbreakers: dbs,
      experience: exp,
    }),
  },
  {
    id: "cold-fish",
    label: "铁菠萝",
    emoji: "🥶",
    category: "雷点",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, emotionLevel: Math.max(0, prefs.emotionLevel - 5) },
      dealbreakers: Array.from(new Set([...dbs, "情感沉浸", "CP互动"])),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, emotionLevel: Math.min(10, prefs.emotionLevel + 5) },
      dealbreakers: dbs.filter((d) => d !== "情感沉浸" && d !== "CP互动"),
      experience: exp,
    }),
  },
  {
    id: "newbie",
    label: "第一次玩",
    emoji: "🐣",
    category: "经验",
    apply: (prefs, dbs, _exp) => ({
      preferences: prefs,
      dealbreakers: dbs,
      experience: "新手",
    }),
    remove: (prefs, dbs, _exp) => ({
      preferences: prefs,
      dealbreakers: dbs,
      experience: "进阶",
    }),
  },
  {
    id: "veteran",
    label: "老玩家",
    emoji: "🦉",
    category: "经验",
    apply: (prefs, dbs, _exp) => ({
      preferences: { ...prefs, logicLevel: Math.min(10, prefs.logicLevel + 2) },
      dealbreakers: dbs,
      experience: "老手",
    }),
    remove: (prefs, dbs, _exp) => ({
      preferences: { ...prefs, logicLevel: Math.max(0, prefs.logicLevel - 2) },
      dealbreakers: dbs,
      experience: "进阶",
    }),
  },
  {
    id: "love-strategy",
    label: "爱算计",
    emoji: "🃏",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, mechanicPreference: Math.min(10, prefs.mechanicPreference + 4) },
      dealbreakers: dbs.filter((d) => d !== "机制博弈"),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, mechanicPreference: Math.max(0, prefs.mechanicPreference - 4) },
      dealbreakers: dbs,
      experience: exp,
    }),
  },
  {
    id: "hate-strange",
    label: "不信鬼神",
    emoji: "🚫👻",
    category: "雷点",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.max(0, prefs.horrorTolerance - 3) },
      dealbreakers: Array.from(new Set([...dbs, "灵异设定", "反转过于离谱"])),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.min(10, prefs.horrorTolerance + 3) },
      dealbreakers: dbs.filter((d) => d !== "灵异设定" && d !== "反转过于离谱"),
      experience: exp,
    }),
  },
  {
    id: "love-horror",
    label: "越怕越玩",
    emoji: "👻",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.min(10, prefs.horrorTolerance + 5) },
      dealbreakers: dbs.filter((d) => d !== "恐怖元素" && d !== "灵异设定"),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: { ...prefs, horrorTolerance: Math.max(0, prefs.horrorTolerance - 5) },
      dealbreakers: dbs,
      experience: exp,
    }),
  },
  {
    id: "chill",
    label: "想轻松",
    emoji: "🍃",
    category: "偏好",
    apply: (prefs, dbs, exp) => ({
      preferences: {
        ...prefs,
        logicLevel: Math.max(0, prefs.logicLevel - 2),
        emotionLevel: Math.max(0, prefs.emotionLevel + 1),
      },
      dealbreakers: Array.from(new Set([...dbs, "硬核推理", "长时间坐牢"])),
      experience: exp,
    }),
    remove: (prefs, dbs, exp) => ({
      preferences: {
        ...prefs,
        logicLevel: Math.min(10, prefs.logicLevel + 2),
        emotionLevel: Math.max(0, prefs.emotionLevel - 1),
      },
      dealbreakers: dbs.filter((d) => d !== "硬核推理" && d !== "长时间坐牢"),
      experience: exp,
    }),
  },
];

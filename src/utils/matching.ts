import type { Player, Car, CarWarning, Script } from "@/types";
import { getExperienceScore, DEALBREAKER_SCRIPT_MAP } from "./playerTags";

export function detectCarWarnings(
  car: Car,
  players: Player[],
  script: Script
): CarWarning[] {
  const warnings: CarWarning[] = [];
  const carPlayers = players.filter((p) => car.playerIds.includes(p.id));

  if (carPlayers.length < 2) return warnings;

  const logicLevels = carPlayers.map((p) => p.preferences.logicLevel);
  const logicDiff = Math.max(...logicLevels) - Math.min(...logicLevels);
  if (logicDiff >= 5) {
    warnings.push({
      type: "conflict",
      message: "推理强度差异大：部分玩家偏好硬核推理，部分不太感冒",
    });
  }

  const horrorLevels = carPlayers.map((p) => p.preferences.horrorTolerance);
  const horrorDiff = Math.max(...horrorLevels) - Math.min(...horrorLevels);
  if (horrorDiff >= 5) {
    warnings.push({
      type: "conflict",
      message: "恐怖接受度差异大：有玩家能接受恐怖，有玩家完全不行",
    });
  }

  for (const player of carPlayers) {
    for (const db of player.dealbreakers) {
      const checker = DEALBREAKER_SCRIPT_MAP[db];
      if (checker(script.horrorLevel, script.logicLevel, script.emotionLevel, script.mechanicLevel, script.duration, script.subTypes)) {
        warnings.push({
          type: "conflict",
          message: `玩家「${player.name}」拒绝${db}，本剧本含此类元素`,
        });
      }
    }
  }

  if (script.horrorLevel >= 6) {
    const rejecters = carPlayers.filter(
      (p) => p.preferences.horrorTolerance <= 3
    );
    if (rejecters.length > 0) {
      warnings.push({
        type: "conflict",
        message: `有${rejecters.length}位玩家拒绝灵异/恐怖设定，本剧本灵异指数${script.horrorLevel}/10`,
      });
    }
  }

  const expScores = carPlayers.map((p) => getExperienceScore(p.experience));
  const expDiff = Math.max(...expScores) - Math.min(...expScores);
  if (expDiff >= 3) {
    warnings.push({
      type: "suggestion",
      message: "玩家经验差距较大，新手可能跟不上节奏",
    });
  }

  if (script.logicLevel >= 7) {
    const lowLogic = carPlayers.filter((p) => p.preferences.logicLevel <= 3);
    if (lowLogic.length > 0) {
      warnings.push({
        type: "suggestion",
        message: `有${lowLogic.length}位玩家推理偏好低，硬核本可能坐牢`,
      });
    }
  }

  if (script.emotionLevel >= 7) {
    const lowEmotion = carPlayers.filter(
      (p) => p.preferences.emotionLevel <= 3
    );
    if (lowEmotion.length > 0) {
      warnings.push({
        type: "suggestion",
        message: `有${lowEmotion.length}位玩家情感沉浸偏好低，可能无法共情`,
      });
    }
  }

  return warnings;
}

export function suggestAlternativeScript(
  car: Car,
  players: Player[],
  allScripts: Script[],
  selectedScriptIds: string[]
): Script | null {
  const carPlayers = players.filter((p) => car.playerIds.includes(p.id));
  if (carPlayers.length < 2) return null;

  const currentScript = allScripts.find((s) => s.id === car.scriptId);
  if (!currentScript) return null;

  const availableScripts = allScripts.filter(
    (s) =>
      selectedScriptIds.includes(s.id) &&
      s.id !== currentScript.id &&
      carPlayers.length >= s.playerRange[0] &&
      carPlayers.length <= s.playerRange[1]
  );

  let bestScript: Script | null = null;
  let bestScore = -Infinity;

  for (const script of availableScripts) {
    let score = 0;

    const avgLogic =
      carPlayers.reduce((s, p) => s + p.preferences.logicLevel, 0) /
      carPlayers.length;
    score -= Math.abs(avgLogic - script.logicLevel) * 2;

    const avgEmotion =
      carPlayers.reduce((s, p) => s + p.preferences.emotionLevel, 0) /
      carPlayers.length;
    score -= Math.abs(avgEmotion - script.emotionLevel) * 2;

    const avgHorror =
      carPlayers.reduce((s, p) => s + p.preferences.horrorTolerance, 0) /
      carPlayers.length;
    score -= Math.abs(avgHorror - script.horrorLevel) * 2;

    const avgMechanic =
      carPlayers.reduce(
        (s, p) => s + p.preferences.mechanicPreference,
        0
      ) / carPlayers.length;
    score -= Math.abs(avgMechanic - script.mechanicLevel) * 2;

    let dealbreakerCount = 0;
    for (const player of carPlayers) {
      for (const db of player.dealbreakers) {
        const checker = DEALBREAKER_SCRIPT_MAP[db];
        if (checker(script.horrorLevel, script.logicLevel, script.emotionLevel, script.mechanicLevel, script.duration, script.subTypes)) {
          dealbreakerCount++;
        }
      }
    }
    score -= dealbreakerCount * 10;

    if (score > bestScore) {
      bestScore = score;
      bestScript = script;
    }
  }

  return bestScript;
}

export interface ScriptSuggestion {
  script: Script;
  direction: string;
  directionColor: string;
  reasons: string[];
  score: number;
}

const DIRECTION_CATEGORIES = [
  {
    id: "social-realistic",
    label: "社会派本格",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
    filter: (s: Script) => s.subTypes.includes("社会派") || (s.type === "本格" && s.emotionLevel >= 4),
  },
  {
    id: "pure-logic",
    label: "纯本格推理",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/30",
    filter: (s: Script) => s.type === "本格" && s.logicLevel >= 7,
  },
  {
    id: "light-fantasy",
    label: "轻变格",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15 border-purple-500/30",
    filter: (s: Script) => s.type === "变格" && s.horrorLevel <= 5,
  },
  {
    id: "horror-fantasy",
    label: "重口变格",
    color: "text-red-400",
    bgColor: "bg-red-500/15 border-red-500/30",
    filter: (s: Script) => s.type === "变格" && s.horrorLevel >= 6,
  },
  {
    id: "low-horror-mechanic",
    label: "低恐怖机制本",
    color: "text-orange-400",
    bgColor: "bg-orange-500/15 border-orange-500/30",
    filter: (s: Script) => s.mechanicLevel >= 6 && s.horrorLevel <= 4,
  },
  {
    id: "emotional",
    label: "情感沉浸",
    color: "text-pink-400",
    bgColor: "bg-pink-500/15 border-pink-500/30",
    filter: (s: Script) => s.type === "情感" || s.emotionLevel >= 7,
  },
  {
    id: "mechanic-battle",
    label: "机制博弈",
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/30",
    filter: (s: Script) => s.type === "机制" && s.mechanicLevel >= 7,
  },
  {
    id: "horror-scary",
    label: "恐怖本",
    color: "text-rose-400",
    bgColor: "bg-rose-500/15 border-rose-500/30",
    filter: (s: Script) => s.type === "恐怖",
  },
];

function calcScriptScore(script: Script, carPlayers: Player[]): number {
  let score = 0;

  const avgLogic =
    carPlayers.reduce((s, p) => s + p.preferences.logicLevel, 0) /
    carPlayers.length;
  score -= Math.abs(avgLogic - script.logicLevel) * 2;

  const avgEmotion =
    carPlayers.reduce((s, p) => s + p.preferences.emotionLevel, 0) /
    carPlayers.length;
  score -= Math.abs(avgEmotion - script.emotionLevel) * 2;

  const avgHorror =
    carPlayers.reduce((s, p) => s + p.preferences.horrorTolerance, 0) /
    carPlayers.length;
  score -= Math.abs(avgHorror - script.horrorLevel) * 2.5;

  const avgMechanic =
    carPlayers.reduce(
      (s, p) => s + p.preferences.mechanicPreference,
      0
    ) / carPlayers.length;
  score -= Math.abs(avgMechanic - script.mechanicLevel) * 1.5;

  let dealbreakerCount = 0;
  for (const player of carPlayers) {
    for (const db of player.dealbreakers) {
      const checker = DEALBREAKER_SCRIPT_MAP[db];
      if (checker(script.horrorLevel, script.logicLevel, script.emotionLevel, script.mechanicLevel, script.duration, script.subTypes)) {
        dealbreakerCount++;
      }
    }
  }
  score -= dealbreakerCount * 12;

  return score;
}

function generateSuggestionReasons(script: Script, carPlayers: Player[]): string[] {
  const reasons: string[] = [];

  const avgLogic = carPlayers.reduce((s, p) => s + p.preferences.logicLevel, 0) / carPlayers.length;
  if (Math.abs(avgLogic - script.logicLevel) <= 2) {
    if (script.logicLevel >= 7) reasons.push("推理强度匹配，硬核玩家有参与感");
    else if (script.logicLevel <= 3) reasons.push("推理轻松，不易坐牢");
    else reasons.push("推理强度适中，各阶段玩家都能跟上");
  }

  const avgHorror = carPlayers.reduce((s, p) => s + p.preferences.horrorTolerance, 0) / carPlayers.length;
  if (script.horrorLevel <= 2) {
    reasons.push("几乎无恐怖元素，怕吓玩家友好");
  } else if (Math.abs(avgHorror - script.horrorLevel) <= 2) {
    reasons.push("恐怖接受度与剧本匹配");
  }

  const avgEmotion = carPlayers.reduce((s, p) => s + p.preferences.emotionLevel, 0) / carPlayers.length;
  if (Math.abs(avgEmotion - script.emotionLevel) <= 2 && script.emotionLevel >= 6) {
    reasons.push("情感浓度合适，沉浸感强");
  }

  const mechanicAvg = carPlayers.reduce((s, p) => s + p.preferences.mechanicPreference, 0) / carPlayers.length;
  if (Math.abs(mechanicAvg - script.mechanicLevel) <= 2 && script.mechanicLevel >= 6) {
    reasons.push("机制丰富，互动性强");
  }

  const noDealbreakers = carPlayers.filter((p) => {
    for (const db of p.dealbreakers) {
      const checker = DEALBREAKER_SCRIPT_MAP[db];
      if (checker(script.horrorLevel, script.logicLevel, script.emotionLevel, script.mechanicLevel, script.duration, script.subTypes)) {
        return false;
      }
    }
    return true;
  });
  if (noDealbreakers.length === carPlayers.length) {
    reasons.push("全车无雷点，安全选择");
  }

  if (reasons.length === 0) reasons.push("综合匹配度较高");
  return reasons.slice(0, 3);
}

export function getDirectionalSuggestions(
  car: Car,
  players: Player[],
  allScripts: Script[],
  selectedScriptIds: string[]
): ScriptSuggestion[] {
  const carPlayers = players.filter((p) => car.playerIds.includes(p.id));
  if (carPlayers.length < 2) return [];

  const currentScript = allScripts.find((s) => s.id === car.scriptId);
  if (!currentScript) return [];

  const suggestions: ScriptSuggestion[] = [];

  for (const cat of DIRECTION_CATEGORIES) {
    const candidates = allScripts.filter(
      (s) =>
        selectedScriptIds.includes(s.id) &&
        s.id !== currentScript.id &&
        cat.filter(s) &&
        carPlayers.length >= s.playerRange[0] &&
        carPlayers.length <= s.playerRange[1]
    );

    if (candidates.length === 0) continue;

    let best: Script | null = null;
    let bestScore = -Infinity;
    for (const script of candidates) {
      const score = calcScriptScore(script, carPlayers);
      if (score > bestScore) {
        bestScore = score;
        best = script;
      }
    }

    if (best) {
      suggestions.push({
        script: best,
        direction: cat.label,
        directionColor: cat.color,
        reasons: generateSuggestionReasons(best, carPlayers),
        score: bestScore,
      });
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 4);
}

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

import type { Player, Car, Script, Recommendation, CarWarning } from "@/types";
import { detectCarWarnings, suggestAlternativeScript } from "./matching";

export function generateRecommendation(
  car: Car,
  players: Player[],
  allScripts: Script[],
  selectedScriptIds: string[]
): Recommendation {
  const carPlayers = players.filter((p) => car.playerIds.includes(p.id));
  const script = allScripts.find((s) => s.id === car.scriptId);

  if (!script || carPlayers.length === 0) {
    return {
      carId: car.id,
      reasons: [],
      risks: [],
      scriptSuggestion: "",
      communicationScript: "",
    };
  }

  const reasons: string[] = [];
  const risks: string[] = [];

  const avgLogic =
    carPlayers.reduce((s, p) => s + p.preferences.logicLevel, 0) /
    carPlayers.length;
  if (Math.abs(avgLogic - script.logicLevel) <= 2) {
    if (script.logicLevel >= 7) {
      reasons.push(
        `${carPlayers.length}位玩家都偏好硬核推理，与《${script.name}》本格推理风格高度契合`
      );
    } else {
      reasons.push(
        `玩家推理偏好与《${script.name}》的推理强度匹配度较高`
      );
    }
  }

  const avgEmotion =
    carPlayers.reduce((s, p) => s + p.preferences.emotionLevel, 0) /
    carPlayers.length;
  if (Math.abs(avgEmotion - script.emotionLevel) <= 2) {
    if (script.emotionLevel >= 7) {
      reasons.push(
        `玩家整体偏好情感沉浸，与《${script.name}》的情感浓度很搭`
      );
    }
  }

  const avgMechanic =
    carPlayers.reduce((s, p) => s + p.preferences.mechanicPreference, 0) /
    carPlayers.length;
  if (Math.abs(avgMechanic - script.mechanicLevel) <= 2) {
    if (script.mechanicLevel >= 7) {
      reasons.push(
        `玩家喜欢机制博弈，《${script.name}》的机制玩法正好满足`
      );
    }
  }

  const avgHorror =
    carPlayers.reduce((s, p) => s + p.preferences.horrorTolerance, 0) /
    carPlayers.length;
  if (script.horrorLevel <= 3 || Math.abs(avgHorror - script.horrorLevel) <= 2) {
    reasons.push(
      script.horrorLevel <= 3
        ? `《${script.name}》几乎没有恐怖元素，对怕恐玩家友好`
        : `玩家恐怖接受度与剧本灵异指数匹配`
    );
  }

  const expCounts = carPlayers.reduce(
    (acc, p) => {
      acc[p.experience]++;
      return acc;
    },
    { "新手": 0, "进阶": 0, "老手": 0 } as Record<string, number>
  );
  if (expCounts["新手"] === 0) {
    reasons.push(`全车都是进阶/老手玩家，可以驾驭有深度的剧本`);
  }
  if (expCounts["新手"] > 0 && script.logicLevel <= 5) {
    reasons.push(`有新手玩家，《${script.name}》推理强度适中，上手门槛不高`);
  }

  if (reasons.length === 0) {
    reasons.push(
      `《${script.name}》综合评分与玩家偏好整体可接受`
    );
  }

  const warnings: CarWarning[] = detectCarWarnings(car, players, script);

  for (const w of warnings) {
    if (w.type === "conflict") {
      risks.push(w.message);
    } else {
      risks.push(`⚠ ${w.message}`);
    }
  }

  for (const player of carPlayers) {
    for (const db of player.dealbreakers) {
      risks.push(`玩家「${player.name}」明确不接受「${db}」，请提前确认`);
    }
  }

  const altScript = suggestAlternativeScript(
    car,
    players,
    allScripts,
    selectedScriptIds
  );
  let scriptSuggestion = "";
  if (altScript && warnings.some((w) => w.type === "conflict")) {
    scriptSuggestion = `考虑换本为《${altScript.name}》（${altScript.type}），更适合当前车位的玩家组合`;
  }

  const playerNames = carPlayers.map((p) => p.name).join("、");
  let communicationScript = `各位好，今天为大家推荐《${script.name}》，`;
  communicationScript += `这是一部${script.type}类型的剧本，`;

  if (script.logicLevel >= 7) {
    communicationScript += "逻辑推理比较硬核，喜欢动脑的朋友会很有参与感；";
  }
  if (script.emotionLevel >= 7) {
    communicationScript += "情感沉浸感很强，容易代入角色；";
  }
  if (script.mechanicLevel >= 7) {
    communicationScript += "有比较丰富的机制环节，博弈性强；";
  }
  if (script.horrorLevel >= 6) {
    communicationScript += "注意：本剧本含灵异/恐怖元素，介意的玩家可以提前告诉我们；";
  }
  if (script.duration >= 4.5) {
    communicationScript += `时长约${script.duration}小时，请合理安排时间；`;
  }

  if (risks.length > 0) {
    communicationScript += "\n\n需要提醒的是：";
    const uniqueRisks = [...new Set(risks)].slice(0, 3);
    for (const r of uniqueRisks) {
      communicationScript += `\n· ${r}`;
    }
  }

  communicationScript += `\n\n祝大家玩得愉快！`;

  return {
    carId: car.id,
    reasons,
    risks: [...new Set(risks)],
    scriptSuggestion,
    communicationScript,
  };
}

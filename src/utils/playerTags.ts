import type { Player, Dealbreaker, Experience } from "@/types";

export function generatePlayerTags(player: Player): string[] {
  const tags: string[] = [];
  const { preferences, dealbreakers, experience } = player;

  if (preferences.logicLevel >= 7) {
    tags.push("硬核推理优先");
  } else if (preferences.logicLevel >= 4) {
    tags.push("推理可接受");
  } else {
    tags.push("推理不敏感");
  }

  if (dealbreakers.includes("灵异设定")) {
    tags.push("拒绝灵异设定");
  } else if (preferences.horrorTolerance <= 2) {
    tags.push("灵异谨慎");
  } else if (preferences.horrorTolerance >= 7) {
    tags.push("灵异可尝试");
  } else {
    tags.push("灵异看情况");
  }

  if (preferences.horrorTolerance >= 8) {
    tags.push("恐怖爱好者");
  } else if (preferences.horrorTolerance <= 3) {
    tags.push("强恐怖谨慎");
  }

  if (preferences.emotionLevel >= 7) {
    tags.push("情感沉浸友好");
  } else if (preferences.emotionLevel <= 2) {
    tags.push("情感沉浸谨慎");
  }

  if (preferences.mechanicPreference >= 7) {
    tags.push("机制博弈爱好者");
  } else if (preferences.mechanicPreference <= 2) {
    tags.push("机制不感兴趣");
  }

  if (dealbreakers.includes("恐怖元素")) {
    tags.push("拒绝恐怖");
  }
  if (dealbreakers.includes("情感沉浸")) {
    tags.push("拒绝情感沉浸");
  }
  if (dealbreakers.includes("CP互动")) {
    tags.push("拒绝CP互动");
  }
  if (dealbreakers.includes("长时间坐牢")) {
    tags.push("拒绝长时间本");
  }
  if (dealbreakers.includes("反转过于离谱")) {
    tags.push("强变格谨慎");
  } else if (preferences.logicLevel >= 6 && preferences.horrorTolerance >= 4) {
    tags.push("变格可尝试");
  }

  if (experience === "新手") {
    tags.push("新手友好优先");
  } else if (experience === "老手") {
    tags.push("老手可挑战");
  }

  return [...new Set(tags)];
}

export function getExperienceScore(exp: Experience): number {
  switch (exp) {
    case "新手":
      return 1;
    case "进阶":
      return 3;
    case "老手":
      return 5;
  }
}

export const DEALBREAKER_SCRIPT_MAP: Record<Dealbreaker, (scriptHorror: number, scriptLogic: number, scriptEmotion: number, scriptMechanic: number, scriptDuration: number, subTypes: string[]) => boolean> = {
  "灵异设定": (horror, _logic, _emotion, _mechanic, _duration, subTypes) =>
    horror >= 5 || subTypes.includes("变格"),
  "恐怖元素": (horror) => horror >= 4,
  "情感沉浸": (_horror, _logic, emotion, _mechanic, _duration, _subTypes) =>
    emotion >= 7,
  "硬核推理": (_horror, logic, _emotion, _mechanic, _duration, _subTypes) =>
    logic >= 8,
  "机制博弈": (_horror, _logic, _emotion, mechanic, _duration, _subTypes) =>
    mechanic >= 7,
  "CP互动": (_horror, _logic, _emotion, _mechanic, _duration, _subTypes) =>
    _subTypes.includes("情感"),
  "长时间坐牢": (_horror, _logic, _emotion, _mechanic, duration, _subTypes) =>
    duration >= 4.5,
  "反转过于离谱": (_horror, _logic, _emotion, _mechanic, _duration, subTypes) =>
    subTypes.includes("变格") && !subTypes.includes("本格"),
};

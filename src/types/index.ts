export type ScriptType = "本格" | "变格" | "社会派" | "情感" | "机制" | "恐怖";

export interface Script {
  id: string;
  name: string;
  type: ScriptType;
  subTypes: ScriptType[];
  playerRange: [number, number];
  duration: number;
  tags: string[];
  horrorLevel: number;
  logicLevel: number;
  emotionLevel: number;
  mechanicLevel: number;
  description: string;
}

export type Experience = "新手" | "进阶" | "老手";

export interface PlayerPreferences {
  logicLevel: number;
  emotionLevel: number;
  horrorTolerance: number;
  mechanicPreference: number;
}

export type Dealbreaker =
  | "灵异设定"
  | "恐怖元素"
  | "情感沉浸"
  | "硬核推理"
  | "机制博弈"
  | "CP互动"
  | "长时间坐牢"
  | "反转过于离谱";

export const ALL_DEALBREAKERS: Dealbreaker[] = [
  "灵异设定",
  "恐怖元素",
  "情感沉浸",
  "硬核推理",
  "机制博弈",
  "CP互动",
  "长时间坐牢",
  "反转过于离谱",
];

export interface Player {
  id: string;
  name: string;
  experience: Experience;
  preferences: PlayerPreferences;
  dealbreakers: Dealbreaker[];
  tags: string[];
  assignedCarId: string | null;
}

export interface CarWarning {
  type: "conflict" | "suggestion" | "info";
  message: string;
}

export interface Car {
  id: string;
  scriptId: string;
  playerIds: string[];
}

export interface Recommendation {
  carId: string;
  reasons: string[];
  risks: string[];
  scriptSuggestion: string;
  communicationScript: string;
}

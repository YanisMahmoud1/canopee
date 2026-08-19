export type TrackingType = "BOOLEAN" | "SCALE" | "COUNTER";
export type Frequency = "DAILY" | "SPECIFIC_DAYS" | "WEEKLY";
export type ProjectType = "LONG_TERM" | "ONE_SHOT" | "RECURRING";
export type ProjectStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type MilestoneStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";
export type EnergyPeriod = "MORNING" | "AFTERNOON" | "EVENING";
export type WeatherState = "sun" | "cloud" | "rain" | "empty";

export interface ScoreThresholds {
  sun: number; // fraction (0-1) of max possible points -> "sun"
  cloud: number; // fraction (0-1) of max possible points -> "cloud" (below this: rain)
}

export interface DayScore {
  date: string;
  earned: number;
  possible: number;
  fraction: number;
  weather: WeatherState;
}

// Tree growth stages for habit gamification, keyed by "streak strength"
export type TreeStage =
  | "seed"
  | "sprout"
  | "sapling"
  | "blooming"
  | "fruiting"
  | "ancient";

export interface TreeState {
  stage: TreeStage;
  vigor: number; // 0-1, how healthy/wilted the tree currently looks
  streakDays: number;
}

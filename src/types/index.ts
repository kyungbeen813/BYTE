export interface Student {
  id?: number;
  grade: number;
  classNum: number;
  number: number;
  name: string;
  memo?: string;
  createdAt: number;
  updatedAt: number;
}

export type ActivityType = "자율활동" | "동아리활동" | "진로활동";

export type RecordType = "세특" | "행동특성" | ActivityType;

export interface SubjectRecord {
  id?: number;
  studentId: number;
  subject: string;
  semester: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface BehaviorRecord {
  id?: number;
  studentId: number;
  semester: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityRecord {
  id?: number;
  studentId: number;
  activityType: ActivityType;
  semester: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type SchoolType = "일반학교" | "특수학교";

export interface AppSettings {
  id?: number;
  schoolType: SchoolType;
  onDeviceModel: string;
  charLimits: Record<RecordType, number>;
}

export const DEFAULT_CHAR_LIMITS: Record<RecordType, number> = {
  세특: 500,
  행동특성: 500,
  자율활동: 500,
  동아리활동: 500,
  진로활동: 700,
};

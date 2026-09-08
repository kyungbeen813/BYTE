import Dexie, { type Table } from "dexie";
import type {
  Student,
  SubjectRecord,
  BehaviorRecord,
  ActivityRecord,
  AppSettings,
} from "../types";
import { DEFAULT_CHAR_LIMITS } from "../types";
import { DEFAULT_MODEL_ID } from "../lib/webllm";

class SchoolEditorDB extends Dexie {
  students!: Table<Student, number>;
  subjectRecords!: Table<SubjectRecord, number>;
  behaviorRecords!: Table<BehaviorRecord, number>;
  activityRecords!: Table<ActivityRecord, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super("schooleditor");
    this.version(1).stores({
      students: "++id, grade, classNum, number, name",
      subjectRecords: "++id, studentId, subject, semester",
      behaviorRecords: "++id, studentId, semester",
      activityRecords: "++id, studentId, activityType, semester",
      settings: "++id",
    });
  }
}

export const db = new SchoolEditorDB();

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  const defaults: AppSettings = {
    schoolType: "일반학교",
    onDeviceModel: DEFAULT_MODEL_ID,
    charLimits: { ...DEFAULT_CHAR_LIMITS },
  };
  const id = await db.settings.add(defaults);
  return { ...defaults, id };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (settings.id == null) {
    await db.settings.add(settings);
  } else {
    await db.settings.put(settings);
  }
}

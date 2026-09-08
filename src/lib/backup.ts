import { db } from "../db/db";

export async function exportBackup(): Promise<void> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    students: await db.students.toArray(),
    subjectRecords: await db.subjectRecords.toArray(),
    behaviorRecords: await db.behaviorRecords.toArray(),
    activityRecords: await db.activityRecords.toArray(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `schooleditor-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!confirm("가져오기를 실행하면 기존 데이터에 추가됩니다. 계속할까요?")) return;

  await db.transaction(
    "rw",
    db.students,
    db.subjectRecords,
    db.behaviorRecords,
    db.activityRecords,
    async () => {
      const idMap = new Map<number, number>();
      for (const s of data.students ?? []) {
        const newId = await db.students.add({
          grade: s.grade,
          classNum: s.classNum,
          number: s.number,
          name: s.name,
          memo: s.memo,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        });
        idMap.set(s.id, newId as number);
      }
      for (const r of data.subjectRecords ?? []) {
        const newStudentId = idMap.get(r.studentId);
        if (newStudentId == null) continue;
        await db.subjectRecords.add({
          studentId: newStudentId,
          subject: r.subject,
          semester: r.semester,
          content: r.content,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
      for (const r of data.behaviorRecords ?? []) {
        const newStudentId = idMap.get(r.studentId);
        if (newStudentId == null) continue;
        await db.behaviorRecords.add({
          studentId: newStudentId,
          semester: r.semester,
          content: r.content,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
      for (const r of data.activityRecords ?? []) {
        const newStudentId = idMap.get(r.studentId);
        if (newStudentId == null) continue;
        await db.activityRecords.add({
          studentId: newStudentId,
          activityType: r.activityType,
          semester: r.semester,
          content: r.content,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
    }
  );
}

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import ContentEditor from "./ContentEditor";
import type { ActivityType, AppSettings } from "../types";

interface ActivitySectionProps {
  studentId: number;
  settings: AppSettings;
}

const ACTIVITY_TYPES: ActivityType[] = ["자율활동", "동아리활동", "진로활동"];

export default function ActivitySection({ studentId, settings }: ActivitySectionProps) {
  const [activeType, setActiveType] = useState<ActivityType>("자율활동");
  const records = useLiveQuery(
    () => db.activityRecords.where("studentId").equals(studentId).toArray(),
    [studentId]
  );
  const allRecords = useLiveQuery(() => db.activityRecords.toArray(), []);
  const students = useLiveQuery(() => db.students.toArray(), []);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newSemester, setNewSemester] = useState("1학기");

  const typeRecords = (records ?? []).filter((r) => r.activityType === activeType);
  const selected = typeRecords.find((r) => r.id === selectedId) ?? null;

  function switchType(t: ActivityType) {
    setActiveType(t);
    setSelectedId(null);
  }

  async function addEntry() {
    const exists = typeRecords.some((r) => r.semester === newSemester);
    if (exists) {
      alert("해당 학기 기록이 이미 있습니다.");
      return;
    }
    const now = Date.now();
    const id = await db.activityRecords.add({
      studentId,
      activityType: activeType,
      semester: newSemester,
      content: "",
      createdAt: now,
      updatedAt: now,
    });
    setSelectedId(id as number);
  }

  async function updateContent(content: string) {
    if (selected?.id == null) return;
    await db.activityRecords.update(selected.id, { content, updatedAt: Date.now() });
  }

  async function removeRecord(id: number) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    await db.activityRecords.delete(id);
    if (selectedId === id) setSelectedId(null);
  }

  const studentNameOf = (sid: number) =>
    (students ?? []).find((s) => s.id === sid)?.name ?? "";

  const similarCandidates =
    selected == null
      ? []
      : (allRecords ?? [])
          .filter(
            (r) =>
              r.id !== selected.id &&
              r.activityType === selected.activityType &&
              r.semester === selected.semester &&
              r.content.trim() !== ""
          )
          .map((r) => ({
            text: r.content,
            label: `${studentNameOf(r.studentId)} (${r.activityType}/${r.semester})`,
          }));

  return (
    <div className="record-section">
      <div className="record-list-col">
        <div className="activity-tabs">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={t === activeType ? "active" : ""}
              onClick={() => switchType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="record-add-row">
          <select value={newSemester} onChange={(e) => setNewSemester(e.target.value)}>
            <option value="1학기">1학기</option>
            <option value="2학기">2학기</option>
          </select>
          <button type="button" onClick={addEntry}>
            추가
          </button>
        </div>
        <ul className="record-list">
          {typeRecords.map((r) => (
            <li
              key={r.id}
              className={r.id === selectedId ? "selected" : ""}
              onClick={() => setSelectedId(r.id ?? null)}
            >
              <span>{r.semester}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (r.id != null) removeRecord(r.id);
                }}
              >
                삭제
              </button>
            </li>
          ))}
          {typeRecords.length === 0 && <li className="empty">기록이 없습니다.</li>}
        </ul>
      </div>

      <div className="record-editor-col">
        {selected ? (
          <ContentEditor
            key={selected.id}
            value={selected.content}
            onChange={updateContent}
            recordType={activeType}
            charLimit={settings.charLimits[activeType]}
            schoolType={settings.schoolType}
            modelId={settings.onDeviceModel}
            similarCandidates={similarCandidates}
          />
        ) : (
          <div className="empty-hint">왼쪽에서 학기를 추가하거나 선택하세요.</div>
        )}
      </div>
    </div>
  );
}

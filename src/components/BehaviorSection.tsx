import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import ContentEditor from "./ContentEditor";
import type { AppSettings } from "../types";

interface BehaviorSectionProps {
  studentId: number;
  settings: AppSettings;
}

export default function BehaviorSection({ studentId, settings }: BehaviorSectionProps) {
  const records = useLiveQuery(
    () => db.behaviorRecords.where("studentId").equals(studentId).toArray(),
    [studentId]
  );
  const allRecords = useLiveQuery(() => db.behaviorRecords.toArray(), []);
  const students = useLiveQuery(() => db.students.toArray(), []);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newSemester, setNewSemester] = useState("1학기");

  const selected = (records ?? []).find((r) => r.id === selectedId) ?? null;

  async function addEntry() {
    const exists = (records ?? []).some((r) => r.semester === newSemester);
    if (exists) {
      alert("해당 학기 기록이 이미 있습니다.");
      return;
    }
    const now = Date.now();
    const id = await db.behaviorRecords.add({
      studentId,
      semester: newSemester,
      content: "",
      createdAt: now,
      updatedAt: now,
    });
    setSelectedId(id as number);
  }

  async function updateContent(content: string) {
    if (selected?.id == null) return;
    await db.behaviorRecords.update(selected.id, { content, updatedAt: Date.now() });
  }

  async function removeRecord(id: number) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    await db.behaviorRecords.delete(id);
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
              r.semester === selected.semester &&
              r.content.trim() !== ""
          )
          .map((r) => ({
            text: r.content,
            label: `${studentNameOf(r.studentId)} (${r.semester})`,
          }));

  return (
    <div className="record-section">
      <div className="record-list-col">
        <div className="record-add-row">
          <select value={newSemester} onChange={(e) => setNewSemester(e.target.value)}>
            <option value="1학기">1학기</option>
            <option value="2학기">2학기</option>
            <option value="학년말">학년말</option>
          </select>
          <button type="button" onClick={addEntry}>
            추가
          </button>
        </div>
        <ul className="record-list">
          {(records ?? []).map((r) => (
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
          {(records ?? []).length === 0 && <li className="empty">기록이 없습니다.</li>}
        </ul>
      </div>

      <div className="record-editor-col">
        {selected ? (
          <ContentEditor
            key={selected.id}
            value={selected.content}
            onChange={updateContent}
            recordType="행동특성"
            charLimit={settings.charLimits.행동특성}
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

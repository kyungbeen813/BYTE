import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import ContentEditor from "./ContentEditor";
import type { AppSettings } from "../types";

interface SubjectSectionProps {
  studentId: number;
  settings: AppSettings;
}

export default function SubjectSection({ studentId, settings }: SubjectSectionProps) {
  const records = useLiveQuery(
    () => db.subjectRecords.where("studentId").equals(studentId).toArray(),
    [studentId]
  );
  const allRecords = useLiveQuery(() => db.subjectRecords.toArray(), []);
  const students = useLiveQuery(() => db.students.toArray(), []);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newSemester, setNewSemester] = useState("1학기");

  const selected = (records ?? []).find((r) => r.id === selectedId) ?? null;

  async function addSubject() {
    if (!newSubject.trim()) return;
    const now = Date.now();
    const id = await db.subjectRecords.add({
      studentId,
      subject: newSubject.trim(),
      semester: newSemester,
      content: "",
      createdAt: now,
      updatedAt: now,
    });
    setNewSubject("");
    setSelectedId(id as number);
  }

  async function updateContent(content: string) {
    if (selected?.id == null) return;
    await db.subjectRecords.update(selected.id, { content, updatedAt: Date.now() });
  }

  async function removeRecord(id: number) {
    if (!confirm("이 과목 기록을 삭제할까요?")) return;
    await db.subjectRecords.delete(id);
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
              r.subject === selected.subject &&
              r.semester === selected.semester &&
              r.content.trim() !== ""
          )
          .map((r) => ({
            text: r.content,
            label: `${studentNameOf(r.studentId)} (${r.subject}/${r.semester})`,
          }));

  return (
    <div className="record-section">
      <div className="record-list-col">
        <div className="record-add-row">
          <input
            type="text"
            placeholder="과목명 (예: 수학)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <select value={newSemester} onChange={(e) => setNewSemester(e.target.value)}>
            <option value="1학기">1학기</option>
            <option value="2학기">2학기</option>
          </select>
          <button type="button" onClick={addSubject}>
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
              <span>
                {r.subject} · {r.semester}
              </span>
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
          {(records ?? []).length === 0 && (
            <li className="empty">등록된 과목이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="record-editor-col">
        {selected ? (
          <ContentEditor
            key={selected.id}
            value={selected.content}
            onChange={updateContent}
            recordType="세특"
            charLimit={settings.charLimits.세특}
            schoolType={settings.schoolType}
            modelId={settings.onDeviceModel}
            similarCandidates={similarCandidates}
          />
        ) : (
          <div className="empty-hint">왼쪽에서 과목을 추가하거나 선택하세요.</div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Student } from "../types";

interface StudentPanelProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const emptyForm = { grade: 1, classNum: 1, number: 1, name: "" };

export default function StudentPanel({ selectedId, onSelect }: StudentPanelProps) {
  const students = useLiveQuery(() => db.students.toArray(), []);
  const [filterGrade, setFilterGrade] = useState<number | "all">("all");
  const [filterClass, setFilterClass] = useState<number | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const grades = useMemo(
    () => Array.from(new Set((students ?? []).map((s) => s.grade))).sort((a, b) => a - b),
    [students]
  );
  const classes = useMemo(
    () =>
      Array.from(
        new Set(
          (students ?? [])
            .filter((s) => filterGrade === "all" || s.grade === filterGrade)
            .map((s) => s.classNum)
        )
      ).sort((a, b) => a - b),
    [students, filterGrade]
  );

  const filtered = (students ?? [])
    .filter((s) => filterGrade === "all" || s.grade === filterGrade)
    .filter((s) => filterClass === "all" || s.classNum === filterClass)
    .sort((a, b) => a.grade - b.grade || a.classNum - b.classNum || a.number - b.number);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(s: Student) {
    setEditingId(s.id ?? null);
    setForm({ grade: s.grade, classNum: s.classNum, number: s.number, name: s.name });
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const now = Date.now();
    if (editingId != null) {
      await db.students.update(editingId, { ...form, updatedAt: now });
    } else {
      const id = await db.students.add({ ...form, createdAt: now, updatedAt: now });
      onSelect(id as number);
    }
    setShowForm(false);
  }

  async function removeStudent(id: number) {
    if (!confirm("이 학생과 관련된 모든 기록을 삭제합니다. 계속할까요?")) return;
    await db.students.delete(id);
    await db.subjectRecords.where("studentId").equals(id).delete();
    await db.behaviorRecords.where("studentId").equals(id).delete();
    await db.activityRecords.where("studentId").equals(id).delete();
  }

  return (
    <div className="student-panel">
      <div className="student-panel-header">
        <h2>학생 명단</h2>
        <button type="button" onClick={openAddForm}>
          + 학생 추가
        </button>
      </div>

      <div className="student-filters">
        <select
          value={filterGrade}
          onChange={(e) => {
            setFilterGrade(e.target.value === "all" ? "all" : Number(e.target.value));
            setFilterClass("all");
          }}
        >
          <option value="all">전체 학년</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}학년
            </option>
          ))}
        </select>
        <select
          value={filterClass}
          onChange={(e) =>
            setFilterClass(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">전체 반</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}반
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={submitForm}>
          <div className="student-form-row">
            <input
              type="number"
              min={1}
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}
              placeholder="학년"
            />
            <input
              type="number"
              min={1}
              value={form.classNum}
              onChange={(e) => setForm({ ...form, classNum: Number(e.target.value) })}
              placeholder="반"
            />
            <input
              type="number"
              min={1}
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              placeholder="번호"
            />
          </div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="이름"
            required
          />
          <div className="student-form-actions">
            <button type="submit">{editingId != null ? "수정 저장" : "추가"}</button>
            <button type="button" onClick={() => setShowForm(false)}>
              취소
            </button>
          </div>
        </form>
      )}

      <ul className="student-list">
        {filtered.map((s) => (
          <li
            key={s.id}
            className={s.id === selectedId ? "selected" : ""}
            onClick={() => s.id != null && onSelect(s.id)}
          >
            <span className="student-meta">
              {s.grade}-{s.classNum}-{s.number}
            </span>
            <span className="student-name">{s.name}</span>
            <span className="student-actions">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditForm(s);
                }}
              >
                수정
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (s.id != null) removeStudent(s.id);
                }}
              >
                삭제
              </button>
            </span>
          </li>
        ))}
        {filtered.length === 0 && <li className="empty">등록된 학생이 없습니다.</li>}
      </ul>
    </div>
  );
}

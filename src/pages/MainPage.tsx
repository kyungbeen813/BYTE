import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../db/db";
import StudentPanel from "../components/StudentPanel";
import SubjectSection from "../components/SubjectSection";
import BehaviorSection from "../components/BehaviorSection";
import ActivitySection from "../components/ActivitySection";
import AiStatus from "../components/AiStatus";
import { useAuth } from "../context/AuthContext";
import type { AppSettings } from "../types";

type Tab = "세특" | "행동특성" | "창체";

export default function MainPage({ settings }: { settings: AppSettings }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("세특");
  const student = useLiveQuery(
    () => (selectedId != null ? db.students.get(selectedId) : undefined),
    [selectedId]
  );
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>학교생활기록부 에디터</h1>
        <div className="app-header-right">
          <AiStatus settings={settings} />
          <span className="school-type-badge">{settings.schoolType}</span>
          <span className="plan-badge-inline">{profile?.plan === "free" || !profile ? "Free" : profile.plan}</span>
          <Link to="settings">설정</Link>
          {user && (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button type="button" onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <StudentPanel selectedId={selectedId} onSelect={setSelectedId} />

        <main className="workspace">
          {student ? (
            <>
              <div className="workspace-header">
                <h2>
                  {student.grade}학년 {student.classNum}반 {student.number}번{" "}
                  {student.name}
                </h2>
                <div className="tab-buttons">
                  {(["세특", "행동특성", "창체"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={t === tab ? "active" : ""}
                      onClick={() => setTab(t)}
                    >
                      {t === "세특" ? "세부능력 및 특기사항" : t === "행동특성" ? "행동특성 및 종합의견" : "창의적 체험활동"}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "세특" && (
                <SubjectSection studentId={student.id!} settings={settings} />
              )}
              {tab === "행동특성" && (
                <BehaviorSection studentId={student.id!} settings={settings} />
              )}
              {tab === "창체" && (
                <ActivitySection studentId={student.id!} settings={settings} />
              )}
            </>
          ) : (
            <div className="empty-hint">왼쪽에서 학생을 선택하거나 추가하세요.</div>
          )}
        </main>
      </div>
    </div>
  );
}

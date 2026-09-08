import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { AppSettings, RecordType, SchoolType } from "../types";
import {
  ON_DEVICE_MODELS,
  deleteCachedModel,
  isModelCached,
  isWebGPUSupported,
  preloadModel,
  type LoadProgress,
} from "../lib/webllm";
import { exportBackup, importBackup } from "../lib/backup";

const RECORD_TYPES: RecordType[] = ["세특", "행동특성", "자율활동", "동아리활동", "진로활동"];

interface SettingsPageProps {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => Promise<void>;
}

export default function SettingsPage({ settings, onUpdate }: SettingsPageProps) {
  const [webgpuOk, setWebgpuOk] = useState<boolean | null>(null);
  const [cachedMap, setCachedMap] = useState<Record<string, boolean>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<LoadProgress | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isWebGPUSupported().then(setWebgpuOk);
    refreshCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshCache() {
    const entries = await Promise.all(
      ON_DEVICE_MODELS.map(async (m) => [m.id, await isModelCached(m.id)] as const)
    );
    setCachedMap(Object.fromEntries(entries));
  }

  async function selectModel(id: string) {
    await onUpdate({ onDeviceModel: id });
  }

  async function downloadModel(id: string) {
    setDownloadingId(id);
    setDownloadProgress(null);
    setStatusMsg("");
    try {
      await preloadModel(id, setDownloadProgress);
      await refreshCache();
    } catch {
      setStatusMsg("모델 다운로드에 실패했습니다. 네트워크 연결을 확인해 주세요.");
    } finally {
      setDownloadingId(null);
      setDownloadProgress(null);
    }
  }

  async function removeModel(id: string) {
    if (!confirm("다운로드한 모델 파일을 삭제할까요?")) return;
    await deleteCachedModel(id);
    await refreshCache();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importBackup(file);
    if (fileRef.current) fileRef.current.value = "";
    alert("가져오기가 완료되었습니다.");
  }

  return (
    <div className="settings-page">
      <header className="app-header">
        <h1>설정</h1>
        <Link to="..">← 돌아가기</Link>
      </header>

      <section className="settings-section">
        <h2>학교 유형</h2>
        <p className="settings-desc">
          선택한 학교 유형에 따라 AI 생성 문체와 서술 가이드가 달라집니다.
        </p>
        <div className="school-type-select">
          {(["일반학교", "특수학교"] as SchoolType[]).map((t) => (
            <label key={t}>
              <input
                type="radio"
                name="schoolType"
                checked={settings.schoolType === t}
                onChange={() => onUpdate({ schoolType: t })}
              />
              {t}
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>온디바이스 AI</h2>
        <p className="settings-desc">
          AI는 별도 서버 설치 없이 이 브라우저 안에서 직접 실행됩니다. 학생 기록은 기기
          밖으로 전송되지 않습니다. 최초 사용 시 선택한 모델을 한 번만 내려받아 브라우저에
          저장해 두고 이후에는 인터넷 연결 없이도 재사용합니다.
        </p>
        {webgpuOk === false && (
          <div className="settings-status">
            이 브라우저는 WebGPU를 지원하지 않아 온디바이스 AI를 사용할 수 없습니다. 최신
            버전의 Chrome 또는 Edge 브라우저를 사용해 주세요.
          </div>
        )}
        {statusMsg && <div className="settings-status">{statusMsg}</div>}

        <div className="model-list">
          {ON_DEVICE_MODELS.map((m) => (
            <div className="model-card" key={m.id}>
              <div className="model-card-head">
                <strong>{m.label}</strong>
                <span className="model-tag">{m.sizeLabel}</span>
                {cachedMap[m.id] && <span className="model-tag installed">다운로드됨</span>}
              </div>
              <p>{m.desc}</p>
              <div className="settings-row">
                <button
                  type="button"
                  className={settings.onDeviceModel === m.id ? "active" : ""}
                  onClick={() => selectModel(m.id)}
                >
                  {settings.onDeviceModel === m.id ? "사용 중" : "이 모델 사용하기"}
                </button>
                {cachedMap[m.id] ? (
                  <button type="button" onClick={() => removeModel(m.id)}>
                    캐시 삭제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadModel(m.id)}
                    disabled={downloadingId === m.id}
                  >
                    {downloadingId === m.id
                      ? `다운로드 중... ${
                          downloadProgress ? Math.round(downloadProgress.progress * 100) : 0
                        }%`
                      : "미리 다운로드"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>항목별 글자수 제한</h2>
        <p className="settings-desc">
          나이스 규정은 학년도별로 바뀔 수 있어 직접 조정할 수 있습니다.
        </p>
        <table className="limits-table">
          <tbody>
            {RECORD_TYPES.map((rt) => (
              <tr key={rt}>
                <td>{rt}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={settings.charLimits[rt]}
                    onChange={(e) =>
                      onUpdate({
                        charLimits: {
                          ...settings.charLimits,
                          [rt]: Number(e.target.value),
                        },
                      })
                    }
                  />
                  자
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="settings-section">
        <h2>데이터 백업</h2>
        <p className="settings-desc">
          모든 데이터는 이 브라우저(로컬)에만 저장됩니다. 정기적으로 백업 파일을
          내려받아 보관하세요.
        </p>
        <div className="settings-row">
          <button type="button" onClick={exportBackup}>
            백업 내보내기 (JSON)
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} />
        </div>
      </section>
    </div>
  );
}

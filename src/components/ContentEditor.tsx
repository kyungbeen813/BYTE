import { useEffect, useRef, useState } from "react";
import type { RecordType, SchoolType } from "../types";
import { generateOnDevice } from "../lib/webllm";
import {
  buildSystemPrompt,
  buildDraftPrompt,
  buildPolishPrompt,
  buildSummarizePrompt,
  buildDiversifyPrompt,
} from "../lib/prompts";
import { charCount, findSimilar } from "../lib/textUtil";
import type { SimilarMatch } from "../lib/textUtil";

interface SimilarCandidate {
  text: string;
  label: string;
}

interface ContentEditorProps {
  value: string;
  onChange: (v: string) => void;
  recordType: RecordType;
  charLimit: number;
  schoolType: SchoolType;
  modelId: string;
  similarCandidates?: SimilarCandidate[];
}

type AiMode = "draft" | "polish" | "summarize" | "diversify" | null;

export default function ContentEditor({
  value,
  onChange,
  recordType,
  charLimit,
  schoolType,
  modelId,
  similarCandidates = [],
}: ContentEditorProps) {
  const [aiMode, setAiMode] = useState<AiMode>(null);
  const [keywords, setKeywords] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<SimilarMatch[]>([]);
  const [loadStatus, setLoadStatus] = useState("");

  // Local editing buffer, debounced to persistence. `value`/`onChange` round-trip through
  // IndexedDB via useLiveQuery, which is async — binding the textarea directly to `value`
  // races fast typing against that round-trip and drops keystrokes.
  const [text, setText] = useState(value);
  const textRef = useRef(text);
  const savedRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (text === savedRef.current) return;
    const timer = setTimeout(() => {
      savedRef.current = text;
      onChangeRef.current(text);
    }, 400);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    return () => {
      if (textRef.current !== savedRef.current) {
        onChangeRef.current(textRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyText(next: string) {
    setText(next);
    savedRef.current = next;
    onChangeRef.current(next);
  }

  const count = charCount(text);
  const over = count > charLimit;

  async function run(promptText: string) {
    setLoading(true);
    setError("");
    setPreview("");
    setLoadStatus("");
    try {
      const system = buildSystemPrompt(schoolType, recordType, charLimit);
      const result = await generateOnDevice({
        modelId,
        system,
        prompt: promptText,
        onToken: (chunk) => setPreview((p) => p + chunk),
        onProgress: (p) => setLoadStatus(p.text),
      });
      setPreview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setLoadStatus("");
    }
  }

  function startDraft() {
    setAiMode("draft");
    setKeywords("");
    setPreview("");
    setError("");
  }

  function submitDraft() {
    if (!keywords.trim()) return;
    run(buildDraftPrompt(recordType, keywords));
  }

  function startPolish() {
    setAiMode("polish");
    if (!text.trim()) {
      setError("먼저 원문을 입력해 주세요.");
      return;
    }
    run(buildPolishPrompt(recordType, text));
  }

  function startSummarize() {
    setAiMode("summarize");
    if (!text.trim()) {
      setError("먼저 원문을 입력해 주세요.");
      return;
    }
    run(buildSummarizePrompt(recordType, text, charLimit));
  }

  function startDiversify() {
    setAiMode("diversify");
    setError("");
    setPreview("");
    if (!text.trim()) {
      setError("먼저 원문을 입력해 주세요.");
      return;
    }
    const found = findSimilar(text, similarCandidates);
    setMatches(found);
    if (found.length === 0) {
      setError("표현이 겹치는 다른 기록이 발견되지 않았습니다.");
      return;
    }
    run(
      buildDiversifyPrompt(
        recordType,
        text,
        found.slice(0, 5).map((m) => m.text)
      )
    );
  }

  function applyPreview() {
    applyText(preview);
    closeAi();
  }

  function closeAi() {
    setAiMode(null);
    setPreview("");
    setKeywords("");
    setError("");
    setMatches([]);
  }

  return (
    <div className="content-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={startDraft}>
          초안 생성
        </button>
        <button type="button" onClick={startPolish}>
          문체 다듬기
        </button>
        <button type="button" onClick={startSummarize}>
          글자수 요약
        </button>
        <button type="button" onClick={startDiversify}>
          중복 표현 확인
        </button>
        <span className={`char-count ${over ? "over" : ""}`}>
          {count} / {charLimit}자
        </span>
      </div>

      <textarea
        className="content-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="내용을 입력하세요."
      />

      {aiMode && (
        <div className="ai-panel">
          {aiMode === "draft" && (
            <div className="ai-draft-input">
              <label>관찰 메모 / 키워드</label>
              <textarea
                rows={3}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="예: 모둠 실험에서 자료 조사를 주도함, 발표 자료를 시각적으로 잘 정리함"
              />
              <button type="button" onClick={submitDraft} disabled={loading}>
                {loading ? "생성 중..." : "초안 생성하기"}
              </button>
            </div>
          )}

          {aiMode === "diversify" && matches.length > 0 && (
            <div className="ai-matches">
              <strong>유사 표현 발견 ({matches.length}건)</strong>
              <ul>
                {matches.slice(0, 5).map((m, i) => (
                  <li key={i}>
                    <span className="match-label">{m.label}</span> · 유사도{" "}
                    {(m.score * 100).toFixed(0)}%
                    <div className="match-text">{m.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className="ai-error">{error}</div>}

          {(loading || preview) && (
            <div className="ai-preview">
              <label>AI 결과 미리보기 ({charCount(preview)}자)</label>
              <div className="ai-preview-text">
                {preview || (loadStatus ? `모델 준비 중... ${loadStatus}` : "생성 중...")}
              </div>
              {!loading && preview && (
                <div className="ai-preview-actions">
                  <button type="button" onClick={applyPreview}>
                    적용하기
                  </button>
                  <button type="button" onClick={closeAi}>
                    닫기
                  </button>
                </div>
              )}
            </div>
          )}

          {!loading && !preview && aiMode !== "draft" && (
            <button type="button" onClick={closeAi}>
              닫기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

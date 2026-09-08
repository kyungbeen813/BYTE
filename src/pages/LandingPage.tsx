import { Link } from "react-router-dom";
import MarketingHeader from "../components/MarketingHeader";

const FEATURES = [
  {
    title: "세부능력 및 특기사항",
    desc: "과목·학기별로 관찰 메모만 입력하면 나이스 문체(개조식·명사형 종결)에 맞춘 초안을 생성합니다.",
  },
  {
    title: "행동특성 및 종합의견",
    desc: "학생의 인성, 태도, 교우 관계를 구체적 사례 중심으로 정리하고 다듬어 줍니다.",
  },
  {
    title: "창의적 체험활동",
    desc: "자율·동아리·진로 활동을 학기별로 관리하고 글자수 제한에 맞게 요약합니다.",
  },
  {
    title: "중복 표현 자동 확인",
    desc: "같은 항목에 이미 작성된 다른 학생 기록과 비교해 표현이 겹치지 않도록 도와줍니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />

      <section className="hero-section">
        <span className="hero-badge">일반학교 · 특수학교 지원</span>
        <h1>생활기록부 작성, AI와 함께 더 빠르고 안전하게</h1>
        <p className="hero-sub">
          학생 개인정보는 선생님의 기기 밖으로 나가지 않습니다. AI는 별도 설치 없이 이
          브라우저 안에서 직접 실행되는 온디바이스 모델로만 동작합니다.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-primary btn-lg">
            무료로 시작하기
          </Link>
          <Link to="/pricing" className="btn-secondary btn-lg">
            요금제 보기
          </Link>
        </div>
      </section>

      <section className="privacy-strip">
        <div>
          <strong>서버 무전송</strong>
          <span>학생 기록은 오직 이 브라우저(기기)에만 저장됩니다.</span>
        </div>
        <div>
          <strong>온디바이스 AI</strong>
          <span>브라우저 내장 WebGPU로 실행되어 AI 요청이 외부로 나가지 않습니다.</span>
        </div>
        <div>
          <strong>학교 유형 맞춤</strong>
          <span>일반학교/특수학교 서술 가이드를 선택해 사용합니다.</span>
        </div>
      </section>

      <section className="features-section">
        <h2>핵심 기능</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>지금 무료로 시작해 보세요</h2>
        <p>가입 후 바로 학생 명단을 추가하고 기록 작성을 시작할 수 있습니다.</p>
        <Link to="/signup" className="btn-primary btn-lg">
          무료로 시작하기
        </Link>
      </section>

      <footer className="marketing-footer">
        <span>생기부메이트</span>
        <Link to="/pricing">요금제</Link>
        <Link to="/login">로그인</Link>
      </footer>
    </div>
  );
}

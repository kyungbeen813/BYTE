import { Link } from "react-router-dom";
import MarketingHeader from "../components/MarketingHeader";

export default function PricingPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <section className="pricing-section">
        <h1>요금제</h1>
        <p className="pricing-sub">
          지금은 모든 기능을 무료로 제공합니다. 유료 요금제는 준비 중입니다.
        </p>

        <div className="pricing-cards">
          <div className="pricing-card current">
            <span className="plan-badge">현재 이용 가능</span>
            <h2>Free</h2>
            <p className="plan-price">₩0</p>
            <ul>
              <li>학생 명단 관리</li>
              <li>세부능력 및 특기사항 편집</li>
              <li>행동특성 및 종합의견 편집</li>
              <li>창의적 체험활동 편집</li>
              <li>온디바이스 AI 초안·다듬기·요약·중복확인</li>
              <li>JSON 백업 내보내기/가져오기</li>
            </ul>
            <Link to="/signup" className="btn-primary">
              무료로 시작하기
            </Link>
          </div>

          <div className="pricing-card disabled">
            <span className="plan-badge">Coming soon</span>
            <h2>Pro</h2>
            <p className="plan-price">준비 중</p>
            <ul>
              <li>여러 학급 동시 관리</li>
              <li>동료 교사와 템플릿 공유</li>
              <li>우선 지원</li>
            </ul>
            <button type="button" disabled>
              출시 예정
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

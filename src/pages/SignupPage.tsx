import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketingHeader from "../components/MarketingHeader";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error, needsEmailConfirmation } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    if (needsEmailConfirmation) {
      setNeedsConfirmation(true);
      return;
    }
    navigate("/app");
  }

  if (needsConfirmation) {
    return (
      <div className="marketing-page">
        <MarketingHeader />
        <div className="auth-wrap">
          <div className="auth-card">
            <h1>이메일을 확인해 주세요</h1>
            <p>
              <strong>{email}</strong>로 인증 메일을 보냈습니다. 메일의 링크를 클릭하면
              로그인할 수 있습니다.
            </p>
            <Link to="/login" className="btn-primary">
              로그인 페이지로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1>무료로 시작하기</h1>
          {!configured && (
            <p className="auth-warning">
              Supabase가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.
            </p>
          )}
          <label>
            이메일
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.kr"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading || !configured}>
            {loading ? "가입 중..." : "무료 계정 만들기"}
          </button>
          <p className="auth-switch">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

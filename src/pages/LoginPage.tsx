import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketingHeader from "../components/MarketingHeader";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/app");
  }

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1>로그인</h1>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading || !configured}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <p className="auth-switch">
            아직 계정이 없으신가요? <Link to="/signup">무료로 시작하기</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

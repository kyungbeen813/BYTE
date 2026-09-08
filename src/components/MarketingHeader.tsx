import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MarketingHeader() {
  const { configured, user } = useAuth();

  return (
    <header className="marketing-header">
      <Link to="/" className="marketing-logo">
        생기부메이트
      </Link>
      <nav className="marketing-nav">
        <Link to="/pricing">요금제</Link>
        {configured && user ? (
          <Link to="/app" className="btn-primary">
            에디터로 이동
          </Link>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup" className="btn-primary">
              무료로 시작하기
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

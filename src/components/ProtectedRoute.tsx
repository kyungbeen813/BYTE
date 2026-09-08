import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { configured, loading, user } = useAuth();

  if (!configured) {
    return (
      <div className="setup-needed">
        <h2>Supabase 설정이 필요합니다</h2>
        <p>
          <code>.env</code> 파일에 <code>VITE_SUPABASE_URL</code>과{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>를 설정한 뒤 다시 시작해 주세요.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-screen">불러오는 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

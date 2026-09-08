import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSettingsStore } from "./store/settingsStore";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PricingPage from "./pages/PricingPage";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";

function AppWorkspace() {
  const { settings, loaded, load, update } = useSettingsStore();

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded || !settings) {
    return <div className="loading-screen">불러오는 중...</div>;
  }

  return (
    <Routes>
      <Route index element={<MainPage settings={settings} />} />
      <Route path="settings" element={<SettingsPage settings={settings} onUpdate={update} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppWorkspace />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

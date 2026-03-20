import { useState } from "react";
import Icon from "@/components/ui/icon";
import { AUTH_URL, AuthScreen, User } from "./types";

interface AuthPageProps {
  onAuth: (user: User, token: string) => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ username: "", display_name: "", password: "" });

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    const res = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Ошибка входа"); return; }
    localStorage.setItem("wave_token", data.token);
    onAuth(data.user, data.token);
  };

  const handleRegister = async () => {
    if (!regForm.username || !regForm.display_name || !regForm.password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    const res = await fetch(`${AUTH_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Ошибка регистрации"); return; }
    localStorage.setItem("wave_token", data.token);
    onAuth(data.user, data.token);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-background mesh-bg px-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center animate-float shadow-[0_0_40px_rgba(168,85,247,0.4)]">
          <Icon name="Waves" size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="font-cormorant text-4xl text-white font-light glow-text-purple tracking-wide">Волна</h1>
          <p className="text-sm text-muted-foreground mt-1">мессенджер нового поколения</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 border border-white/10">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-2xl p-1">
          {(["login", "register"] as AuthScreen[]).map(s => (
            <button
              key={s}
              onClick={() => { setScreen(s); setError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${screen === s ? "nav-item-active text-white" : "text-muted-foreground hover:text-white"}`}
            >
              {s === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        {screen === "login" ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Никнейм</label>
              <input
                value={loginForm.username}
                onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="your_username"
                className="w-full px-4 py-3 rounded-2xl glass text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-purple/50 border border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl glass text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-purple/50 border border-transparent transition-all"
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" />Вход...</span> : "Войти"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Имя и фамилия</label>
              <input
                value={regForm.display_name}
                onChange={e => setRegForm(p => ({ ...p, display_name: e.target.value }))}
                placeholder="Иван Петров"
                className="w-full px-4 py-3 rounded-2xl glass text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-purple/50 border border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Никнейм</label>
              <input
                value={regForm.username}
                onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))}
                placeholder="ivan_petrov"
                className="w-full px-4 py-3 rounded-2xl glass text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-purple/50 border border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={regForm.password}
                onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                placeholder="минимум 6 символов"
                className="w-full px-4 py-3 rounded-2xl glass text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-purple/50 border border-transparent transition-all"
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" />Создаю аккаунт...</span> : "Создать аккаунт"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/5f6a86ea-ec4a-448b-b7a1-4d8a8e6edf8c";

type Tab = "chats" | "nearby" | "profile";
type ChatId = "alice" | "boris" | "chat" | null;
type AuthScreen = "login" | "register";

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_initials: string;
  avatar_color: string;
  bio: string;
}

interface Message {
  id: number;
  text: string;
  out: boolean;
  time: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
  lastMsg: string;
  time: string;
  unread?: number;
  distance?: string;
  color: string;
}

const CONTACTS: Contact[] = [
  { id: "alice", name: "Алиса Лунная", avatar: "АЛ", color: "#a855f7", online: true, status: "В сети", lastMsg: "Это звучит невероятно ✨", time: "сейчас", unread: 2 },
  { id: "boris", name: "Борис Эфир", avatar: "БЭ", color: "#06b6d4", online: false, status: "Был(а) в 18:30", lastMsg: "Завтра встретимся?", time: "18:30" },
  { id: "chat", name: "Творческий Клуб", avatar: "ТК", color: "#ec4899", online: true, status: "12 участников", lastMsg: "Новый проект запущен!", time: "16:00", unread: 7 },
];

const NEARBY: Contact[] = [
  { id: "n1", name: "Мара Зефир", avatar: "МЗ", color: "#a855f7", online: true, status: "Дизайнер", lastMsg: "500м от вас", time: "", distance: "500 м" },
  { id: "n2", name: "Слава Орбит", avatar: "СО", color: "#22c55e", online: true, status: "Музыкант", lastMsg: "1.2км от вас", time: "", distance: "1.2 км" },
  { id: "n3", name: "Ева Мираж", avatar: "ЕМ", color: "#06b6d4", online: true, status: "Фотограф", lastMsg: "2км от вас", time: "", distance: "2 км" },
  { id: "n4", name: "Тим Волна", avatar: "ТВ", color: "#ec4899", online: false, status: "Программист", lastMsg: "3.5км от вас", time: "", distance: "3.5 км" },
];

const MESSAGES: Record<string, Message[]> = {
  alice: [
    { id: 1, text: "Привет! Как настроение сегодня?", out: false, time: "10:00", read: true },
    { id: 2, text: "Отличное! Только что вернулась с выставки", out: true, time: "10:02", read: true },
    { id: 3, text: "О, что там было?", out: false, time: "10:03", read: true },
    { id: 4, text: "Это звучит невероятно ✨", out: false, time: "10:05", read: false },
  ],
  boris: [
    { id: 1, text: "Привет! Как дела?", out: true, time: "вчера", read: true },
    { id: 2, text: "Всё хорошо, спасибо!", out: false, time: "вчера", read: true },
    { id: 3, text: "Завтра встретимся?", out: false, time: "18:30", read: true },
  ],
  chat: [
    { id: 1, text: "Всем привет! Рады видеть вас в клубе 🎨", out: false, time: "09:00", read: true },
    { id: 2, text: "Спасибо! Рад присоединиться!", out: true, time: "09:15", read: true },
    { id: 3, text: "Новый проект запущен!", out: false, time: "16:00", read: false },
  ],
};

const NOTIFICATIONS = [
  { id: 1, icon: "MessageCircle", color: "#a855f7", text: "Алиса отправила вам сообщение", time: "только что" },
  { id: 2, icon: "MapPin", color: "#06b6d4", text: "Рядом с вами появился новый пользователь", time: "5 мин назад" },
  { id: 3, icon: "Users", color: "#ec4899", text: "Творческий Клуб: 3 новых сообщения", time: "16:00" },
  { id: 4, icon: "Heart", color: "#22c55e", text: "Борис Эфир добавил вас в контакты", time: "вчера" },
];

// Auth screen component
function AuthPage({ onAuth }: { onAuth: (user: User, token: string) => void }) {
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

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("chats");
  const [openChat, setOpenChat] = useState<ChatId>(null);
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locGranted, setLocGranted] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", bio: "" });
  const [saveLoading, setSaveLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("wave_token");
    if (!savedToken) { setAuthLoading(false); return; }
    fetch(`${AUTH_URL}?action=me`, { headers: { "X-Session-Token": savedToken } })
      .then(r => r.json())
      .then(data => {
        if (data.user) { setUser(data.user); setToken(savedToken); }
        else { localStorage.removeItem("wave_token"); }
      })
      .catch(() => localStorage.removeItem("wave_token"))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [openChat, messages]);

  const handleAuth = (u: User, t: string) => { setUser(u); setToken(t); };

  const handleLogout = async () => {
    await fetch(`${AUTH_URL}?action=logout`, { method: "POST", headers: { "X-Session-Token": token } });
    localStorage.removeItem("wave_token");
    setUser(null); setToken("");
  };

  const sendMessage = () => {
    if (!input.trim() || !openChat) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages(prev => ({
      ...prev,
      [openChat]: [...(prev[openChat] || []), { id: Date.now(), text: input.trim(), out: true, time, read: false }]
    }));
    setInput("");
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    const res = await fetch(`${AUTH_URL}?action=me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setSaveLoading(false);
    if (data.user) { setUser(data.user); setEditingProfile(false); }
  };

  const requestLocation = () => {
    setLocLoading(true);
    setTimeout(() => { setLocGranted(true); setLocLoading(false); }, 1500);
  };

  const currentContact = openChat ? CONTACTS.find(c => c.id === openChat) : null;
  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background mesh-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center animate-float">
            <Icon name="Waves" size={24} className="text-white" />
          </div>
          <Icon name="Loader2" size={20} className="text-neon-purple animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background mesh-bg font-golos">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {openChat ? (
            <button onClick={() => setOpenChat(null)} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Icon name="ArrowLeft" size={18} className="text-foreground/70" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center animate-float">
                <Icon name="Waves" size={16} className="text-white" />
              </div>
              <span className="font-cormorant text-2xl font-light tracking-wide text-white glow-text-purple">Волна</span>
            </div>
          )}
          {openChat && currentContact && (
            <div className="animate-fade-in">
              <p className="font-semibold text-sm text-white leading-tight">{currentContact.name}</p>
              <p className="text-xs text-muted-foreground">{currentContact.status}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!openChat && (
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Icon name="Bell" size={17} className="text-foreground/70" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-purple rounded-full animate-ping-slow" />
            </button>
          )}
          {!openChat && (
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Icon name="Search" size={17} className="text-foreground/70" />
            </button>
          )}
          {openChat && (
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Icon name="Phone" size={17} className="text-neon-cyan" />
            </button>
          )}
        </div>
      </header>

      {/* Notification Panel */}
      {showNotif && !openChat && (
        <div className="mx-4 mb-2 glass-strong rounded-2xl p-4 animate-fade-in border border-neon-purple/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Уведомления</span>
            <button onClick={() => setShowNotif(false)} className="text-muted-foreground hover:text-white transition-colors">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="space-y-2.5">
            {NOTIFICATIONS.map((n, i) => (
              <div key={n.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}20`, border: `1px solid ${n.color}40` }}>
                  <Icon name={n.icon} size={14} style={{ color: n.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 leading-snug">{n.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">

        {/* === CHATS TAB === */}
        {tab === "chats" && !openChat && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 mb-3">
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск сообщений..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scroll-custom px-4 space-y-2 pb-4">
              {filteredContacts.map((contact, i) => (
                <button
                  key={contact.id}
                  onClick={() => setOpenChat(contact.id as ChatId)}
                  className="w-full glass rounded-2xl p-3.5 flex items-center gap-3.5 hover:bg-white/[0.07] transition-all text-left animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${contact.color}60, ${contact.color}30)`, border: `1px solid ${contact.color}50` }}>
                      {contact.avatar}
                    </div>
                    {contact.online && <span className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-white truncate">{contact.name}</span>
                      <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{contact.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">{contact.lastMsg}</p>
                      {contact.unread && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-neon-purple text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === CHAT OPEN === */}
        {tab === "chats" && openChat && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scroll-custom px-4 py-2 space-y-2">
              {(messages[openChat] || []).map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.out ? "message-bubble-out rounded-br-sm" : "message-bubble-in rounded-bl-sm"}`}>
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-white/40">{msg.time}</span>
                      {msg.out && <Icon name={msg.read ? "CheckCheck" : "Check"} size={11} className={msg.read ? "text-neon-cyan" : "text-white/40"} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center gap-2 glass-strong rounded-2xl p-2 border border-neon-purple/20">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
                  <Icon name="Paperclip" size={17} className="text-muted-foreground" />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
                />
                <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
                  <Icon name="Smile" size={17} className="text-muted-foreground" />
                </button>
                <button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                  style={{ background: input.trim() ? "linear-gradient(135deg, #a855f7, #06b6d4)" : "rgba(255,255,255,0.05)" }}
                >
                  <Icon name="Send" size={16} className={input.trim() ? "text-white" : "text-muted-foreground"} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === NEARBY TAB === */}
        {tab === "nearby" && (
          <div className="flex-1 overflow-hidden flex flex-col px-4">
            {!locGranted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 pb-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(6,182,212,0.3)" }}>
                    <Icon name="MapPin" size={36} className="text-neon-cyan" />
                  </div>
                  <span className="absolute inset-0 rounded-full border border-neon-cyan/30 animate-ping-slow" />
                </div>
                <div>
                  <h2 className="font-cormorant text-3xl text-white font-light mb-2">Найди своих</h2>
                  <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">Разреши доступ к геолокации, чтобы найти интересных людей рядом</p>
                </div>
                <button
                  onClick={requestLocation}
                  disabled={locLoading}
                  className="px-8 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", boxShadow: "0 4px 20px rgba(168,85,247,0.4)" }}
                >
                  {locLoading ? <span className="flex items-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" /> Определяю...</span> : "Разрешить геолокацию"}
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scroll-custom">
                <div className="flex items-center gap-2 mb-4 glass rounded-2xl px-4 py-3 border border-neon-cyan/20">
                  <span className="online-dot flex-shrink-0" />
                  <span className="text-xs text-foreground/70">Москва, Центральный район · обновлено только что</span>
                </div>
                <div className="glass rounded-3xl p-4 mb-4 border border-white/10 relative overflow-hidden" style={{ height: "160px" }}>
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="absolute border border-white/20 rounded-full" style={{ width: `${(i + 1) * 12}%`, height: `${(i + 1) * 25}%`, top: `${50 - (i + 1) * 12.5}%`, left: `${50 - (i + 1) * 6}%` }} />
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-neon-purple animate-pulse-ring" />
                  </div>
                  {NEARBY.map((u, i) => {
                    const positions = [{ top: "20%", left: "70%" }, { top: "65%", left: "25%" }, { top: "30%", left: "20%" }, { top: "70%", left: "75%" }];
                    return (
                      <div key={u.id} className="absolute z-10 flex flex-col items-center" style={positions[i]}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-background" style={{ background: u.color }}>
                          {u.avatar}
                        </div>
                        <span className="text-[9px] text-white/60 mt-0.5 whitespace-nowrap">{u.distance}</span>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-2 right-3 text-[10px] text-white/30 font-cormorant italic">карта приближения</div>
                </div>
                <div className="space-y-2 pb-4">
                  {NEARBY.map((u, i) => (
                    <div key={u.id} className="glass rounded-2xl p-3.5 flex items-center gap-3.5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${u.color}60, ${u.color}30)`, border: `1px solid ${u.color}50` }}>
                          {u.avatar}
                        </div>
                        {u.online && <span className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.status}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: u.color, background: `${u.color}20`, border: `1px solid ${u.color}30` }}>{u.distance}</span>
                        <button className="text-[11px] text-muted-foreground hover:text-white transition-colors">Написать</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === PROFILE TAB === */}
        {tab === "profile" && (
          <div className="flex-1 overflow-y-auto scroll-custom px-4 pb-4">
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold text-white avatar-ring"
                  style={{ background: `linear-gradient(135deg, ${user.avatar_color}80, ${user.avatar_color}40)` }}
                >
                  {user.avatar_initials}
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-cormorant text-2xl text-white font-light">{user.display_name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">@{user.username} · В сети</p>
                {user.bio && <p className="text-sm text-foreground/60 mt-1.5 max-w-[220px] leading-relaxed">{user.bio}</p>}
              </div>
              <button
                onClick={() => { setEditingProfile(true); setEditForm({ display_name: user.display_name, bio: user.bio }); }}
                className="px-4 py-2 rounded-xl glass text-xs text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/10 transition-colors"
              >
                Редактировать профиль
              </button>
            </div>

            {/* Edit form */}
            {editingProfile && (
              <div className="glass-strong rounded-2xl p-4 mb-4 border border-neon-purple/20 animate-fade-in">
                <p className="text-xs font-semibold text-white mb-3">Редактирование</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                    <input
                      value={editForm.display_name}
                      onChange={e => setEditForm(p => ({ ...p, display_name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl glass text-sm text-white placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">О себе</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl glass text-sm text-white placeholder:text-muted-foreground outline-none resize-none"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProfile(false)} className="flex-1 py-2 rounded-xl glass text-sm text-muted-foreground border border-white/10 hover:text-white transition-colors">
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex-1 py-2 rounded-xl text-sm text-white font-medium transition-all disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)" }}
                    >
                      {saveLoading ? "Сохраняю..." : "Сохранить"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Диалогов", value: "3", color: "#a855f7" },
                { label: "Контактов", value: "12", color: "#06b6d4" },
                { label: "Рядом", value: "4", color: "#ec4899" },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-3 text-center border" style={{ borderColor: `${s.color}30` }}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden mb-3">
              <div className="px-4 py-2.5 border-b border-white/5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Настройки</span>
              </div>
              {[
                { icon: "Bell", label: "Уведомления", color: "#a855f7" },
                { icon: "MapPin", label: "Геолокация", color: "#06b6d4" },
                { icon: "Lock", label: "Приватность", color: "#ec4899" },
                { icon: "Palette", label: "Оформление", color: "#22c55e" },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-0 text-left">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                    <Icon name={item.icon} size={15} style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-sm text-white">{item.label}</span>
                  <Icon name="ChevronRight" size={15} className="text-muted-foreground" />
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full glass rounded-2xl p-3.5 flex items-center justify-center gap-2 text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
            >
              <Icon name="LogOut" size={16} />
              <span className="text-sm font-medium">Выйти</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      {!openChat && (
        <nav className="flex-shrink-0 px-4 pb-5 pt-2">
          <div className="glass-strong rounded-3xl p-1.5 flex items-center gap-1 border border-white/10">
            {[
              { id: "chats", icon: "MessageCircle", label: "Чаты" },
              { id: "nearby", icon: "MapPin", label: "Рядом" },
              { id: "profile", icon: "User", label: "Профиль" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all ${tab === item.id ? "nav-item-active" : "hover:bg-white/[0.04]"}`}
              >
                <Icon name={item.icon} size={20} className={tab === item.id ? "text-neon-purple" : "text-muted-foreground"} />
                <span className={`text-[11px] font-medium ${tab === item.id ? "text-white" : "text-muted-foreground"}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

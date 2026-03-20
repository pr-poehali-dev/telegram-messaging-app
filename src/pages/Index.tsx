import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AuthPage from "@/components/messenger/AuthPage";
import ChatTab from "@/components/messenger/ChatTab";
import NearbyTab from "@/components/messenger/NearbyTab";
import ProfileTab from "@/components/messenger/ProfileTab";
import { AUTH_URL, Tab, ChatId, User, Message, NOTIFICATIONS, INITIAL_MESSAGES, CONTACTS } from "@/components/messenger/types";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("chats");
  const [openChat, setOpenChat] = useState<ChatId>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locGranted, setLocGranted] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

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

  const requestLocation = () => {
    setLocLoading(true);
    setTimeout(() => { setLocGranted(true); setLocLoading(false); }, 1500);
  };

  const currentContact = openChat ? CONTACTS.find(c => c.id === openChat) : null;

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
        {tab === "chats" && (
          <ChatTab
            openChat={openChat}
            messages={messages}
            input={input}
            searchQuery={searchQuery}
            onInputChange={setInput}
            onSend={sendMessage}
            onOpenChat={setOpenChat}
            onSearchChange={setSearchQuery}
          />
        )}
        {tab === "nearby" && (
          <NearbyTab
            locGranted={locGranted}
            locLoading={locLoading}
            onRequestLocation={requestLocation}
          />
        )}
        {tab === "profile" && (
          <ProfileTab
            user={user}
            token={token}
            onUserUpdate={setUser}
            onLogout={handleLogout}
          />
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

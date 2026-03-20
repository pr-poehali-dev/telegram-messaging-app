import { useState } from "react";
import Icon from "@/components/ui/icon";
import { AUTH_URL, User } from "./types";

interface ProfileTabProps {
  user: User;
  token: string;
  onUserUpdate: (u: User) => void;
  onLogout: () => void;
}

export default function ProfileTab({ user, token, onUserUpdate, onLogout }: ProfileTabProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", bio: "" });
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    const res = await fetch(`${AUTH_URL}?action=me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setSaveLoading(false);
    if (data.user) { onUserUpdate(data.user); setEditingProfile(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-custom px-4 pb-4">
      {/* Avatar & name */}
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

      {/* Stats */}
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

      {/* Settings */}
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
        onClick={onLogout}
        className="w-full glass rounded-2xl p-3.5 flex items-center justify-center gap-2 text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
      >
        <Icon name="LogOut" size={16} />
        <span className="text-sm font-medium">Выйти</span>
      </button>
    </div>
  );
}

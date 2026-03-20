import Icon from "@/components/ui/icon";
import { NEARBY } from "./types";

interface NearbyTabProps {
  locGranted: boolean;
  locLoading: boolean;
  onRequestLocation: () => void;
}

export default function NearbyTab({ locGranted, locLoading, onRequestLocation }: NearbyTabProps) {
  return (
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
            onClick={onRequestLocation}
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

          {/* Map visual */}
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
  );
}

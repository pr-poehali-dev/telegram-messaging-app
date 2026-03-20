export const AUTH_URL = "https://functions.poehali.dev/5f6a86ea-ec4a-448b-b7a1-4d8a8e6edf8c";

export type Tab = "chats" | "nearby" | "profile";
export type ChatId = "alice" | "boris" | "chat" | null;
export type AuthScreen = "login" | "register";

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_initials: string;
  avatar_color: string;
  bio: string;
}

export interface Message {
  id: number;
  text: string;
  out: boolean;
  time: string;
  read: boolean;
}

export interface Contact {
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

export const CONTACTS: Contact[] = [
  { id: "alice", name: "Алиса Лунная", avatar: "АЛ", color: "#a855f7", online: true, status: "В сети", lastMsg: "Это звучит невероятно ✨", time: "сейчас", unread: 2 },
  { id: "boris", name: "Борис Эфир", avatar: "БЭ", color: "#06b6d4", online: false, status: "Был(а) в 18:30", lastMsg: "Завтра встретимся?", time: "18:30" },
  { id: "chat", name: "Творческий Клуб", avatar: "ТК", color: "#ec4899", online: true, status: "12 участников", lastMsg: "Новый проект запущен!", time: "16:00", unread: 7 },
];

export const NEARBY: Contact[] = [
  { id: "n1", name: "Мара Зефир", avatar: "МЗ", color: "#a855f7", online: true, status: "Дизайнер", lastMsg: "500м от вас", time: "", distance: "500 м" },
  { id: "n2", name: "Слава Орбит", avatar: "СО", color: "#22c55e", online: true, status: "Музыкант", lastMsg: "1.2км от вас", time: "", distance: "1.2 км" },
  { id: "n3", name: "Ева Мираж", avatar: "ЕМ", color: "#06b6d4", online: true, status: "Фотограф", lastMsg: "2км от вас", time: "", distance: "2 км" },
  { id: "n4", name: "Тим Волна", avatar: "ТВ", color: "#ec4899", online: false, status: "Программист", lastMsg: "3.5км от вас", time: "", distance: "3.5 км" },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
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

export const NOTIFICATIONS = [
  { id: 1, icon: "MessageCircle", color: "#a855f7", text: "Алиса отправила вам сообщение", time: "только что" },
  { id: 2, icon: "MapPin", color: "#06b6d4", text: "Рядом с вами появился новый пользователь", time: "5 мин назад" },
  { id: 3, icon: "Users", color: "#ec4899", text: "Творческий Клуб: 3 новых сообщения", time: "16:00" },
  { id: 4, icon: "Heart", color: "#22c55e", text: "Борис Эфир добавил вас в контакты", time: "вчера" },
];

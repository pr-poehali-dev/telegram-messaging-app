import { useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { ChatId, Contact, Message, CONTACTS } from "./types";

interface ChatListProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filteredContacts: Contact[];
  onOpenChat: (id: ChatId) => void;
}

function ChatList({ searchQuery, onSearchChange, filteredContacts, onOpenChat }: ChatListProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-4 mb-3">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Поиск сообщений..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-custom px-4 space-y-2 pb-4">
        {filteredContacts.map((contact, i) => (
          <button
            key={contact.id}
            onClick={() => onOpenChat(contact.id as ChatId)}
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
  );
}

interface OpenChatProps {
  openChat: ChatId;
  messages: Record<string, Message[]>;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
}

function OpenChat({ openChat, messages, input, onInputChange, onSend }: OpenChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, openChat]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scroll-custom px-4 py-2 space-y-2">
        {(messages[openChat!] || []).map((msg, i) => (
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
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSend()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
          />
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
            <Icon name="Smile" size={17} className="text-muted-foreground" />
          </button>
          <button
            onClick={onSend}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: input.trim() ? "linear-gradient(135deg, #a855f7, #06b6d4)" : "rgba(255,255,255,0.05)" }}
          >
            <Icon name="Send" size={16} className={input.trim() ? "text-white" : "text-muted-foreground"} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChatTabProps {
  openChat: ChatId;
  messages: Record<string, Message[]>;
  input: string;
  searchQuery: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onOpenChat: (id: ChatId) => void;
  onSearchChange: (v: string) => void;
}

export default function ChatTab({ openChat, messages, input, searchQuery, onInputChange, onSend, onOpenChat, onSearchChange }: ChatTabProps) {
  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (openChat) {
    return <OpenChat openChat={openChat} messages={messages} input={input} onInputChange={onInputChange} onSend={onSend} />;
  }

  return <ChatList searchQuery={searchQuery} onSearchChange={onSearchChange} filteredContacts={filteredContacts} onOpenChat={onOpenChat} />;
}

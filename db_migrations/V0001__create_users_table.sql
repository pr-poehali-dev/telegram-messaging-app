CREATE TABLE t_p89155400_telegram_messaging_a.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) UNIQUE,
  avatar_color VARCHAR(20) DEFAULT '#a855f7',
  avatar_initials VARCHAR(4) DEFAULT '',
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT NOW(),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

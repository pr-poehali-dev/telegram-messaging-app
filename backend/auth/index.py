"""
Авторизация пользователей: регистрация, вход, выход, получение профиля.
Параметр action передаётся через queryStringParameters: ?action=register|login|me|logout
"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p89155400_telegram_messaging_a')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper() if name else '??'
# v2


AVATAR_COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    session_token = (event.get('headers') or {}).get('X-Session-Token', '')

    # action=register
    if action == 'register' and method == 'POST':
        username = body.get('username', '').strip().lower()
        display_name = body.get('display_name', '').strip()
        password = body.get('password', '')

        if not username or not display_name or not password:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Заполните все поля'})}
        if len(username) < 3 or len(username) > 50:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Никнейм: 3–50 символов'})}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

        pw_hash = hash_password(password)
        token = secrets.token_hex(32)
        initials = make_initials(display_name)
        color = AVATAR_COLORS[len(username) % len(AVATAR_COLORS)]

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f'SELECT id FROM {SCHEMA}.users WHERE username = %s', (username,))
        if cur.fetchone():
            cur.close(); conn.close()
            return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Никнейм уже занят'})}

        cur.execute(
            f'''INSERT INTO {SCHEMA}.users (username, display_name, password_hash, session_token, avatar_initials, avatar_color, is_online)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id''',
            (username, display_name, pw_hash, token, initials, color)
        )
        user_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()

        return {
            'statusCode': 201,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'token': token,
                'user': {'id': user_id, 'username': username, 'display_name': display_name, 'avatar_initials': initials, 'avatar_color': color, 'bio': ''}
            })
        }

    # action=login
    if action == 'login' and method == 'POST':
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')

        if not username or not password:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Введите никнейм и пароль'})}

        pw_hash = hash_password(password)
        token = secrets.token_hex(32)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f'SELECT id, display_name, avatar_initials, avatar_color, bio FROM {SCHEMA}.users WHERE username = %s AND password_hash = %s', (username, pw_hash))
        row = cur.fetchone()

        if not row:
            cur.close(); conn.close()
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неверный никнейм или пароль'})}

        user_id, display_name, initials, color, bio = row
        cur.execute(f'UPDATE {SCHEMA}.users SET session_token = %s, is_online = TRUE, last_seen = NOW() WHERE id = %s', (token, user_id))
        conn.commit(); cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'token': token,
                'user': {'id': user_id, 'username': username, 'display_name': display_name, 'avatar_initials': initials, 'avatar_color': color, 'bio': bio or ''}
            })
        }

    # action=me GET
    if action == 'me' and method == 'GET':
        if not session_token:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f'SELECT id, username, display_name, avatar_initials, avatar_color, bio FROM {SCHEMA}.users WHERE session_token = %s', (session_token,))
        row = cur.fetchone()
        cur.close(); conn.close()

        if not row:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Сессия истекла'})}

        user_id, username, display_name, initials, color, bio = row
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'user': {'id': user_id, 'username': username, 'display_name': display_name, 'avatar_initials': initials, 'avatar_color': color, 'bio': bio or ''}})
        }

    # action=me PUT
    if action == 'me' and method == 'PUT':
        if not session_token:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}

        display_name = body.get('display_name', '').strip()
        bio = body.get('bio', '')

        conn = get_conn()
        cur = conn.cursor()
        updates = ['updated_at = NOW()']
        params = []
        if display_name:
            updates += ['display_name = %s', 'avatar_initials = %s']
            params += [display_name, make_initials(display_name)]
        updates.append('bio = %s')
        params.append(bio)
        params.append(session_token)

        cur.execute(f'UPDATE {SCHEMA}.users SET {", ".join(updates)} WHERE session_token = %s RETURNING id, username, display_name, avatar_initials, avatar_color, bio', params)
        row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()

        if not row:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Сессия истекла'})}

        user_id, username, disp, initials, color, bio_val = row
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'user': {'id': user_id, 'username': username, 'display_name': disp, 'avatar_initials': initials, 'avatar_color': color, 'bio': bio_val or ''}})
        }

    # action=logout
    if action == 'logout' and method == 'POST':
        if session_token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f'UPDATE {SCHEMA}.users SET session_token = NULL, is_online = FALSE WHERE session_token = %s', (session_token,))
            conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unknown action'})}
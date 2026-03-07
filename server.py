#!/usr/bin/env python3
"""
server.py - Gameboy Game Maker Server
Statische Dateien + KI-Proxy + Game-Sharing via Server-Storage.
"""

import asyncio
import json
import os
import hashlib
import time
import mimetypes
from aiohttp import web, ClientSession, ClientTimeout

def load_env(path='.env'):
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
    if not os.path.isfile(env_path):
        return
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

load_env()

PORT = int(os.environ.get('PORT', 8777))
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
GAMES_DIR = os.path.join(STATIC_DIR, 'shared_games')
os.makedirs(GAMES_DIR, exist_ok=True)

SERVER_API_URL = os.environ.get('API_URL', '').strip()
SERVER_API_KEY = os.environ.get('API_KEY', '').strip()
SERVER_API_MODEL = os.environ.get('API_MODEL', 'gpt-4o-mini').strip()

def has_server_keys():
    return bool(SERVER_API_URL and SERVER_API_KEY and SERVER_API_KEY != 'sk-your-api-key-here')

mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Index-Datei: hash -> game_id Mapping
INDEX_FILE = os.path.join(GAMES_DIR, '_index.json')

def load_index():
    if os.path.isfile(INDEX_FILE):
        with open(INDEX_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_index(index):
    with open(INDEX_FILE, 'w') as f:
        json.dump(index, f)

# === GAME SHARE: SAVE ===
async def save_game_handler(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({'error': 'Ungültiger JSON-Body'}, status=400)
    code = body.get('code', '')
    if not code:
        return web.json_response({'error': 'Kein Spielcode'}, status=400)

    # Hash des Codes berechnen (SHA256, erste 8 Zeichen)
    code_hash = hashlib.sha256(code.encode('utf-8')).hexdigest()[:8]

    # Index laden – existiert das Spiel bereits?
    index = load_index()
    if code_hash in index:
        existing_id = index[code_hash]
        # Plays-Counter erhöhen
        game_path = os.path.join(GAMES_DIR, f'{existing_id}.json')
        if os.path.isfile(game_path):
            with open(game_path, 'r', encoding='utf-8') as f:
                game_data = json.load(f)
            game_data['plays'] = game_data.get('plays', 0) + 1
            with open(game_path, 'w', encoding='utf-8') as f:
                json.dump(game_data, f, ensure_ascii=False)
            return web.json_response({'id': existing_id, 'existing': True})

    # Neues Spiel speichern
    game_id = code_hash  # Hash direkt als ID nutzen
    game_path = os.path.join(GAMES_DIR, f'{game_id}.json')
    game_data = {
        'id': game_id,
        'idea': body.get('idea', ''),
        'genre': body.get('genre'),
        'code': code,
        'hash': code_hash,
        'ts': body.get('ts', time.time()),
        'plays': 1
    }
    with open(game_path, 'w', encoding='utf-8') as f:
        json.dump(game_data, f, ensure_ascii=False)

    # Index aktualisieren
    index[code_hash] = game_id
    save_index(index)

    return web.json_response({'id': game_id, 'existing': False})

# === GAME SHARE: LOAD ===
async def load_game_handler(request):
    game_id = request.match_info['id']
    if not game_id.isalnum() or len(game_id) > 16:
        return web.json_response({'error': 'Ungültige Game-ID'}, status=400)
    game_path = os.path.join(GAMES_DIR, f'{game_id}.json')
    if not os.path.isfile(game_path):
        return web.json_response({'error': 'Spiel nicht gefunden'}, status=404)
    with open(game_path, 'r', encoding='utf-8') as f:
        game_data = json.load(f)
    # Plays-Counter beim Laden erhöhen
    game_data['plays'] = game_data.get('plays', 0) + 1
    with open(game_path, 'w', encoding='utf-8') as f:
        json.dump(game_data, f, ensure_ascii=False)
    return web.json_response(game_data)

# === API STATUS ===
async def api_status_handler(request):
    return web.json_response({
        'serverKeysAvailable': has_server_keys(),
        'model': SERVER_API_MODEL if has_server_keys() else None
    })

# === SERVER GENERATE ===
async def generate_handler(request):
    if not has_server_keys():
        return web.json_response({'error': 'Keine Server-API-Keys konfiguriert.'}, status=503)
    try:
        body = await request.json()
    except Exception:
        return web.json_response({'error': 'Ungültiger JSON-Body'}, status=400)
    payload = body.get('payload', {})
    if not payload:
        return web.json_response({'error': 'payload fehlt'}, status=400)
    if 'model' not in payload:
        payload['model'] = SERVER_API_MODEL
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {SERVER_API_KEY}'}
    timeout = ClientTimeout(total=120)
    try:
        async with ClientSession(timeout=timeout) as session:
            async with session.post(SERVER_API_URL, json=payload, headers=headers) as resp:
                resp_body = await resp.text()
                try:
                    return web.json_response(json.loads(resp_body), status=resp.status)
                except json.JSONDecodeError:
                    return web.Response(text=resp_body, status=resp.status, content_type='text/plain')
    except asyncio.TimeoutError:
        return web.json_response({'error': 'API Timeout (120s)'}, status=504)
    except Exception as e:
        return web.json_response({'error': f'Server-Fehler: {str(e)}'}, status=502)

# === CLIENT PROXY ===
async def proxy_handler(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({'error': 'Ungültiger JSON-Body'}, status=400)
    api_url = body.get('apiUrl', '').strip()
    api_key = body.get('apiKey', '').strip()
    payload = body.get('payload', {})
    if not api_url:
        return web.json_response({'error': 'apiUrl fehlt'}, status=400)
    if not api_key:
        return web.json_response({'error': 'apiKey fehlt'}, status=400)
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'}
    timeout = ClientTimeout(total=120)
    try:
        async with ClientSession(timeout=timeout) as session:
            async with session.post(api_url, json=payload, headers=headers) as resp:
                resp_body = await resp.text()
                try:
                    return web.json_response(json.loads(resp_body), status=resp.status)
                except json.JSONDecodeError:
                    return web.Response(text=resp_body, status=resp.status, content_type='text/plain')
    except asyncio.TimeoutError:
        return web.json_response({'error': 'API Timeout (120s)'}, status=504)
    except Exception as e:
        return web.json_response({'error': f'Proxy-Fehler: {str(e)}'}, status=502)

# === STATIC FILES ===
async def static_handler(request):
    path = request.match_info.get('path', '')
    if not path or path == '/':
        path = 'index.html'
    path = path.lstrip('/')
    if '..' in path:
        return web.Response(text='Forbidden', status=403)
    if path in ('.env',) or path.startswith('shared_games/'):
        return web.Response(text='Forbidden', status=403)
    file_path = os.path.join(STATIC_DIR, path)
    if not os.path.isfile(file_path):
        file_path = os.path.join(STATIC_DIR, 'index.html')
        if not os.path.isfile(file_path):
            return web.Response(text='Not Found', status=404)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'
    with open(file_path, 'rb') as f:
        content = f.read()
    return web.Response(body=content, content_type=content_type)

# === APP ===
def create_app():
    app = web.Application()
    app.router.add_get('/api/status', api_status_handler)
    app.router.add_post('/api/generate', generate_handler)
    app.router.add_post('/api/proxy', proxy_handler)
    app.router.add_post('/api/games', save_game_handler)
    app.router.add_get('/api/games/{id}', load_game_handler)
    app.router.add_get('/{path:.*}', static_handler)
    app.router.add_get('/', static_handler)
    return app

if __name__ == '__main__':
    keys_status = 'Server-Keys geladen' if has_server_keys() else 'Keine Server-Keys (.env)'
    print(f'Gameboy Game Maker Server startet auf Port {PORT}...')
    print(f'   {keys_status}')
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=PORT, print=lambda msg: print(f'   {msg}'))

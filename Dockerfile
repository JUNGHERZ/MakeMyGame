FROM python:3.12-slim

WORKDIR /app

# Dependencies installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Projektdateien kopieren
COPY . .

# Shared Games Ordner anlegen
RUN mkdir -p /app/shared_games

# Port freigeben
EXPOSE 8777

# Server starten
CMD ["python3", "server.py"]

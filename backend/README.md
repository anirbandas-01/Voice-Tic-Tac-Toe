# 🚀 Voice Tic-Tac-Toe Backend API (FastAPI)

> High-performance **FastAPI** backend powering the Voice-Driven Tic-Tac-Toe application. Provides secure server-side **AI move generation** (via Groq Llama 3.3 70B and OpenAI GPT-4o-mini) and **Real-Time Multiplayer** via WebSockets.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Folder Structure](#-folder-structure)
- [Architecture & Detailed Workflow](#-architecture--detailed-workflow)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
  - [1. Health Check (`GET /api/health`)](#1-health-check-get-apihealth)
  - [2. AI Move Proxy (`POST /api/ai-move`)](#2-ai-move-proxy-post-api-ai-move)
  - [3. Create Multiplayer Room (`POST /api/rooms`)](#3-create-multiplayer-room-post-apirooms)
  - [4. Real-Time Multiplayer WebSocket (`WS /ws/{room_code}`)](#4-real-time-multiplayer-websocket-ws-wsroom_code)
- [Configuration (.env)](#-configuration-env)
- [Installation & Setup](#-installation--setup)
- [Running the Server](#-running-the-server)

---

## 🔍 Overview

The backend is built with **FastAPI** and **Uvicorn** to ensure high throughput, zero client-side API key exposure, and robust real-time communication.

Key Responsibilities:
- **API Key Security**: Hides LLM provider API keys (`GROQ_API_KEY`, `OPENAI_API_KEY`) on the server so they are never exposed to the frontend browser.
- **AI Agent Integration**: Proxies game state to Groq (Llama-3.3-70b-versatile) or OpenAI (GPT-4o-mini) with structured function calling (`place_mark`).
- **Real-Time Room Management**: In-memory WebSocket room manager to host 2-player multiplayer games with instantaneous state synchronization.

---

## 🗂️ Folder Structure

```
backend/
├── app/
│   ├── __init__.py         # Package initializer
│   ├── main.py             # FastAPI entrypoint, route handlers, CORS & WebSockets
│   ├── helpers.py          # Groq / OpenAI LLM caller & system prompt handler
│   └── rooms.py            # In-memory Room & RoomManager implementation
├── agents/
│   └── voice-app/
│       ├── prompt.md       # AI Agent system prompt (Tactical Tic-Tac-Toe rules)
│       └── actions.json    # JSON schema for LLM function calling (`place_mark`)
├── .env.example            # Environment variables template
├── .gitignore              # Git exclusion rules
├── requirements.txt        # Python backend dependencies
└── README.md               # Backend technical documentation
```

---

## ⚙️ Architecture & Detailed Workflow

### 🤖 1. Human vs AI Workflow
```
┌─────────────────┐        POST /api/ai-move         ┌──────────────────┐
│  React Frontend │ ───────────────────────────────► │ FastAPI Backend  │
│  (Vite App)     │ ◄─────────────────────────────── │ (app/main.py)    │
└─────────────────┘        JSON: Move Index          └────────┬─────────┘
                                                              │
                                                      Calls LLM Provider
                                                      (Groq / OpenAI)
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │  LLM AI Engine   │
                                                     │ (Llama 3.3 70B)  │
                                                     └──────────────────┘
```
1. Frontend sends current board history messages to `POST /api/ai-move`.
2. Backend validates request payload and attaches server-side API keys.
3. Backend calls Groq or OpenAI with system prompt from `agents/voice-app/prompt.md` and tool schema from `actions.json`.
4. AI calculates optimal move (win / block / strategic center) and returns target square index `(0-8)`.
5. Backend responds to frontend with target move index.

---

### 👥 2. Real-Time Multiplayer Workflow
```
┌──────────────┐          1. POST /api/rooms          ┌──────────────────┐
│ Player 1 (X) │ ───────────────────────────────────► │ FastAPI Backend  │
│              │ ◄─────────────────────────────────── │ (Room Manager)   │
└──────┬───────┘          Returns Room Code           └────────┬─────────┘
       │                                                       │
       │ 2. Connect WS /ws/{room_code}                         │ 3. Connect WS /ws/{room_code}
       ▼                                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        WebSocket Connection Established                 │
│        - Server assigns Symbol 'X' to Player 1 & 'O' to Player 2      │
│        - Real-time turn sync & state broadcast on move/reset          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Documentation & Endpoints

### 1. Health Check (`GET /api/health`)

Verifies backend server status and responsiveness.

- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. AI Move Proxy (`POST /api/ai-move`)

Generates the AI's move securely on the server.

- **URL**: `/api/ai-move`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "messages": [
      {
        "role": "user",
        "content": "Board state: ['X', null, null, null, 'O', null, null, null, null]. Next move for O."
      }
    ]
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "move": 2,
    "raw_response": "Placed O at index 2"
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: Missing API key configuration.
  - `502 Bad Gateway`: AI Provider network/API connection failure.

---

### 3. Create Multiplayer Room (`POST /api/rooms`)

Generates a new unique 4-character room code for 2-player online matches.

- **URL**: `/api/rooms`
- **Method**: `POST`
- **Response (`200 OK`)**:
  ```json
  {
    "code": "A1B2"
  }
  ```

---

### 4. Real-Time Multiplayer WebSocket (`WS /ws/{room_code}`)

Bidirectional WebSocket communication for online 2-player matches.

- **URL**: `ws://localhost:8000/ws/{room_code}`
- **Protocol**: WebSocket

#### Client ➔ Server Messages:

**Place Move:**
```json
{
  "type": "move",
  "index": 4
}
```

**Reset Board:**
```json
{
  "type": "reset"
}
```

#### Server ➔ Client Broadcast Messages:

**Symbol Assignment (sent on connect):**
```json
{
  "type": "assigned",
  "symbol": "X"
}
```

**Room State Update (broadcast on move/connect/reset):**
```json
{
  "squares": ["X", null, null, null, "O", null, null, null, null],
  "turn": "X",
  "playerCount": 2,
  "winner": null,
  "isDraw": false
}
```

---

## 🔑 Configuration (.env)

Create a `.env` file inside the `backend/` directory:

```env
# Groq API Key (Recommended - Ultra fast Llama 3.3 70B inference)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# OpenAI API Key (Optional fallback for GPT-4o-mini)
OPENAI_API_KEY="sk-proj-your_openai_api_key_here"
```

---

## ⚙️ Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create & activate virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux/macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 🚀 Running the Server

Start the development server with **Uvicorn**:

```bash
uvicorn app.main:app --reload --port 8000
```

- Server will start at: `http://localhost:8000`
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

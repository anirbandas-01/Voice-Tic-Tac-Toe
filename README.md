# 🎙️ Voice_to_Voice: Full-Stack Voice AI Tic-Tac-Toe

> A production-grade, full-stack **Voice AI & Generative UI** application featuring **Web Speech Voice Recognition**, **Phonetic Normalization & Levenshtein Fuzzy Matching**, **Synchronized Text-to-Speech Audio Feedback**, **FastAPI Backend AI Proxy**, **Groq (Llama 3.3 70B) / OpenAI (GPT-4o-mini) Tool Calling**, and **Real-Time WebSocket Multiplayer**.

---

## 🖼️ Application Interface Preview

![Voice Tic-Tac-Toe UI Preview](./frontend/public/ui_preview.png)

---

## 📋 Table of Contents

- [Overview & Key Features](#-overview--key-features)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [End-to-End System Workflow](#-end-to-end-system-workflow)
- [Environment Configuration & API Keys](#-environment-configuration--api-keys)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Step-by-Step Installation & Running Guide](#-step-by-step-installation--running-guide)
  - [1. Backend Setup & Run](#1-backend-setup--run)
  - [2. Frontend Setup & Run](#2-frontend-setup--run)
- [Voice Commands & Position Guide](#-voice-commands--position-guide)

---

## 🔍 Overview & Key Features

- 🎤 **Hands-Free Continuous Voice Control**: One click enables continuous listening that automatically syncs with player turns and pauses while the AI is thinking or speaking.
- 🧠 **Phonetic & Levenshtein Fuzzy Parser**: Corrects mishears automatically (e.g. *"top lift"* ➔ *"top left"*, *"bottom write"* ➔ *"bottom right"*, *"botom center"* ➔ *"bottom center"*).
- 🔊 **Complete Audio Feedback (Text-to-Speech)**: Spoken announcements for every action (human moves, AI moves, invalid commands, occupied positions, win/loss/draw results, and mode switches).
- 🚫 **Zero Microphone Crosstalk**: Pauses speech recognition before speaking and waits for Text-to-Speech `onend` events before re-opening the mic.
- 🤖 **Server-Side AI Proxy**: Securely calls Groq Llama 3.3 70B or OpenAI GPT-4o-mini via FastAPI so API keys remain 100% private.
- 👥 **Real-Time Multiplayer**: Instantaneous 2-player online matches via WebSockets.

---

## 🗂️ Project Architecture & Directory Structure

```
Voice_to_Voice/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Package initializer
│   │   ├── main.py             # FastAPI backend server, route handlers & WebSockets
│   │   ├── helpers.py          # LLM provider interface (Groq & OpenAI call_ai_agent)
│   │   └── rooms.py            # Multiplayer Room & RoomManager implementation
│   ├── agents/
│   │   └── voice-app/
│   │       ├── prompt.md       # AI Agent system prompt definition
│   │       └── actions.json    # LLM function calling schema (`place_mark`)
│   ├── .env.example            # Backend environment template
│   ├── requirements.txt        # Python dependencies (FastAPI, Uvicorn, Groq, OpenAI)
│   └── README.md               # Backend technical documentation
│
├── frontend/
│   ├── public/
│   │   ├── ui_preview.png      # Application interface screenshot
│   │   └── favicon.svg         # Favicon asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx       # Human vs AI / 2-Player game board & speech state manager
│   │   │   ├── ModeSwitcher.jsx# Navigation tabs (AI Mode, 2-Player, Online)
│   │   │   ├── MultiplayerBoard.jsx # WebSocket online match component
│   │   │   ├── RoomLobby.jsx   # Online room creation & joining modal
│   │   │   ├── VoiceLegend.jsx # Voice commands cheat sheet
│   │   │   ├── WinnerBadge.jsx # Game completion banner
│   │   │   └── InstallButton.jsx# PWA install prompt button
│   │   ├── lib/
│   │   │   ├── voiceParser.js  # Fuzzy matching & normalization engine
│   │   │   ├── tts.js          # SpeechSynthesis audio feedback coordinator
│   │   │   ├── apiClient.js    # Backend REST API client
│   │   │   ├── gameLogic.js    # Win calculation & board validator
│   │   │   └── multiplayerClient.js # WebSocket client wrapper
│   │   ├── App.jsx             # React root layout & mode router
│   │   ├── main.jsx            # React mounting point
│   │   └── index.css           # Global styling & Tailwind CSS imports
│   ├── package.json            # React & Vite dependencies
│   ├── vite.config.js          # Vite build & PWA configuration
│   └── README.md               # Frontend technical documentation
│
└── README.md                   # Complete root project documentation
```

---

## ⚙️ End-to-End System Workflow

```
 🎤 User Voice Input ("bottom write")
              │
              ▼
 🗣️ Web Speech API (Browser STT)
              │
              ▼
 🧠 Phonetic Normalizer & Fuzzy Parser (voiceParser.js)
    - Normalizes "write" ➔ "right"
    - Levenshtein Distance Score ≥ 0.75 ➔ Matched: "bottom right" (Index 8)
              │
              ▼
 🎯 React Game Board State (Board.jsx)
    - Places Human Mark 'X' at Index 8
    - Triggers SpeechSynthesis: "You selected Bottom Right. X placed at Bottom Right. AI is thinking."
              │
              ▼
 🌐 FastAPI Backend Proxy (POST /api/ai-move)
    - Receives board state
    - Loads system prompt & actions schema
    - Calls Groq (Llama 3.3 70B) / OpenAI (GPT-4o-mini)
              │
              ▼
 🤖 AI Agent Return Move (Index 4: Center)
              │
              ▼
 🔊 Text-to-Speech Audio Out (tts.js)
    - Speaks: "AI placed O at Center. Your turn. Please say your move."
    - Waits for speech `onend` event callback ➔ Re-activates Microphone
```

---

## 🔑 Environment Configuration & API Keys

The application uses server-side environment variables stored in `backend/.env` to keep API keys secure.

Create `backend/.env`:

```env
# Groq API Key (Recommended - Fast Llama 3.3 70B inference)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# OpenAI API Key (Optional fallback for GPT-4o-mini)
OPENAI_API_KEY="sk-proj-your_openai_api_key_here"
```

> **Note**: Frontend requires no API key. All AI calls pass through the FastAPI backend proxy.

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description | Request / Payload Sample |
|---|:---:|---|---|
| `/api/health` | `GET` | Server health check | N/A |
| `/api/ai-move` | `POST` | Generates AI move via Groq/OpenAI | `{"provider":"groq","messages":[{"role":"user","content":"..."}]}` |
| `/api/rooms` | `POST` | Creates a new multiplayer room | N/A ➔ Returns `{"code":"A1B2"}` |
| `/ws/{room_code}` | `WS` | WebSocket connection for real-time match | `{"type":"move","index":4}` or `{"type":"reset"}` |

---

## 🚀 Step-by-Step Installation & Running Guide

### 1. Backend Setup & Run

Open Terminal / PowerShell:

```bash
# Navigate to backend directory
cd Voice_to_Voice/backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

- Backend running at: `http://localhost:8000`
- Swagger Interactive API Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup & Run

Open a **new** Terminal / PowerShell window:

```bash
# Navigate to frontend directory
cd Voice_to_Voice/frontend

# Install Node.js dependencies
npm install

# Start Vite dev server
npm run dev
```

- Frontend running at: `http://localhost:5173`
- Open `http://localhost:5173` in **Google Chrome**, **Microsoft Edge**, or **Brave**.

---

## 🎯 Voice Commands & Position Guide

| Position Number | Primary Spoken Command | Alternative / Misheard Variations Supported |
|:---:|---|---|
| **1** | *"Top Left"* | *"top lift"*, *"one"* |
| **2** | *"Top Center"* | *"top"*, *"two"* |
| **3** | *"Top Right"* | *"top write"*, *"three"* |
| **4** | *"Middle Left"* | *"left"*, *"four"* |
| **5** | *"Center"* | *"middle"*, *"middle center"*, *"five"* |
| **6** | *"Middle Right"* | *"right"*, *"middle write"*, *"six"* |
| **7** | *"Bottom Left"* | *"bottom lift"*, *"seven"* |
| **8** | *"Bottom Center"* | *"botom center"*, *"bottom"*, *"eight"* |
| **9** | *"Bottom Right"* | *"bottom write"*, *"nine"* |

# 🎨 Voice Tic-Tac-Toe Frontend (React + Vite)

> Sleek, accessible **React 19** web application featuring **Web Speech API Voice Recognition**, **Phonetic Normalization & Levenshtein Fuzzy Matching**, **Synchronized Audio Feedback (Text-to-Speech)**, and **Real-Time Multiplayer** WebSockets.

---

## 🖼️ Application Interface Preview

![Voice Tic-Tac-Toe UI Preview](./public/ui_preview.png)

---

## 📋 Table of Contents

- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Frontend Workflows & Architecture](#-frontend-workflows--architecture)
  - [1. Continuous Voice Recognition & Turn Synchronization](#1-continuous-voice-recognition--turn-synchronization)
  - [2. Fuzzy Voice Parsing Pipeline](#2-fuzzy-voice-parsing-pipeline)
  - [3. Audio Feedback & Speech Coordination](#3-audio-feedback--speech-coordination)
- [Key Modules & Components](#-key-modules--components)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)

---

## ✨ Features

- 🎤 **Continuous Hands-Free Voice Control**: Click *Speak* once to activate continuous voice recognition that automatically listens during your turn and pauses while the AI thinks.
- 🧠 **Phonetic & Levenshtein Fuzzy Parser**: Corrects common mishears (e.g. *"top lift"* ➔ *"top left"*, *"bottom write"* ➔ *"bottom right"*, *"botom center"* ➔ *"bottom center"*).
- 🔊 **Complete Audio Announcements (TTS)**: Full spoken feedback for every action (human moves, AI moves, invalid commands, occupied cells, win/loss/draw, and mode switches).
- 🚫 **Zero Microphone Crosstalk**: Pauses speech recognition before speaking and waits for Text-to-Speech `onend` events before re-opening the mic.
- 👥 **Multi-Mode Support**: Human vs AI (Groq Llama 3.3 / OpenAI), 2-Player (Human vs Human), and Online Multiplayer (WebSockets).

---

## 🗂️ Folder Structure

```
frontend/
├── public/
│   ├── favicon.svg             # Application favicon
│   ├── ui_preview.png          # Interface preview screenshot
│   └── pwa-192x192.png         # PWA icon assets
├── src/
│   ├── components/
│   │   ├── Board.jsx           # Main Human vs AI / Human vs Human game board & speech manager
│   │   ├── ModeSwitcher.jsx    # Mode navigation tabs (AI, 2-Player, Online)
│   │   ├── MultiplayerBoard.jsx# Real-time WebSocket board component
│   │   ├── RoomLobby.jsx       # Room creation and joining interface
│   │   ├── VoiceLegend.jsx     # Spoken commands cheatsheet & position helper
│   │   ├── WinnerBadge.jsx     # Win/Draw overlay banner
│   │   └── InstallButton.jsx   # Progressive Web App (PWA) install trigger
│   ├── lib/
│   │   ├── voiceParser.js      # Exact & Levenshtein fuzzy matching voice command parser
│   │   ├── tts.js              # Event-driven SpeechSynthesis audio coordinator
│   │   ├── apiClient.js        # Backend HTTP API proxy client
│   │   ├── gameLogic.js        # Pure Tic-Tac-Toe win calculation & board validator
│   │   └── multiplayerClient.js# WebSocket multiplayer client abstraction
│   ├── App.jsx                 # Root component layout & mode router
│   ├── main.jsx                # React DOM root mounting
│   └── index.css               # Global CSS & Tailwind CSS imports
├── package.json                # React & Vite dependencies
├── vite.config.js              # Vite configuration & PWA setup
└── README.md                   # Frontend technical documentation
```

---

## ⚙️ Frontend Workflows & Architecture

### 1. Continuous Voice Recognition & Turn Synchronization
```
🎤 Speak Button Pressed Once
          │
          ▼
   HUMAN TURN  ──────►  [Listen for Voice Input]
          │                     │
          │             Valid Voice Move
          │                     │
          ▼                     ▼
   AI TURN     ◄──────  [Pause Recognition]
          │
      AI Moves
          │
          ▼
   Check WIN/LOSE/DRAW
          │
  ┌───────┴───────┐
  │ Game Continues│ Game Over
  ▼               ▼
HUMAN TURN     [Stop Recognition Completely]
(Auto-Listen)   (Keep Final Board Displayed)
```

---

### 2. Fuzzy Voice Parsing Pipeline

When a spoken phrase is captured by Web Speech API, `voiceParser.js` executes the following priorities:

```
Spoken Input (e.g., "bottom write")
  │
  ├── 1. Priority 1: Exact Match in POSITION_MAP ➔ (Matched? Return index immediately)
  │
  ├── 2. Priority 2: Phonetic Normalization (e.g., "write" ➔ "right") ➔ "bottom right"
  │
  ├── 3. Priority 3: Contains Known Multi-Word Phrase ➔ "bottom right" (Index 8)
  │
  ├── 4. Priority 4: Levenshtein & Token Similarity Scoring (Threshold ≥ 0.75)
  │
  └── 5. Low Confidence (< 0.75) ➔ Return null (Prompt user to try again)
```

---

### 3. Audio Feedback & Speech Coordination

To prevent the microphone from hearing the browser's own Text-to-Speech output:

```
Action Triggered (e.g. AI Move)
  │
  ├── 1. Immediately pause Web Speech API recognition (abort mic)
  │
  ├── 2. Trigger SpeechSynthesisUtterance: "AI placed O at Bottom Right. Your turn."
  │
  ├── 3. Wait for utterance `onend` event callback
  │
  └── 4. Re-evaluate `canProcessVoice()`. If Human Turn ➔ Start Web Speech API microphone
```

---

## 🧩 Key Modules & Components

- **[`voiceParser.js`](file:///c:/Users/Abhisek%20kundu/Downloads/project/Voice_to_Voice/frontend/src/lib/voiceParser.js)**: Contains `parseVoiceCommand(transcript)` with exact key lookup, phonetic word replacements (`lift`➔`left`, `write`➔`right`, `botom`➔`bottom`), and token + Levenshtein distance similarity calculation.
- **[`tts.js`](file:///c:/Users/Abhisek%20kundu/Downloads/project/Voice_to_Voice/frontend/src/lib/tts.js)**: Exposes `speak(text, onEnd)` and `isSpeakingActive()`. Handles cancellation, browser speech fallback timers, and completion callbacks.
- **[`Board.jsx`](file:///c:/Users/Abhisek%20kundu/Downloads/project/Voice_to_Voice/frontend/src/components/Board.jsx)**: Encapsulates state, board rendering, turn enforcement, AI turn triggering, and speech recognition lifecycle.

---

## ⚙️ Installation & Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

---

## 🚀 Running the Application

Start the Vite development server:

```bash
npm run dev
```

- Local Dev Server: `http://localhost:5173`
- Open the URL in **Google Chrome**, **Microsoft Edge**, or **Brave** for optimal Web Speech API and Speech Synthesis performance.

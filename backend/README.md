# 🎙️ Voice AI & Generative UI Tic-Tac-Toe Application

> A production-ready, modular **Voice AI & Generative UI** application featuring **Speech Recognition (Voice In)**, **Text-to-Speech (Voice Out)**, **LLM Tool Calling** (Groq Llama 3.3 70B & OpenAI GPT-4o), **Strict Turn Control**, **Turn-by-Turn Logging**, and **2-Player (Human vs Human)** mode.

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Architecture & File Structure](#-project-architecture--file-structure)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Installation](#-step-by-step-installation)
- [Configuration (.env)](#-configuration-env)
- [How to Run](#-how-to-run)
  - [Mode 1: Human vs AI Mode (Web App)](#mode-1-human-vs-ai-mode-web-app)
  - [Mode 2: 2-Player Mode (Human vs Human)](#mode-2-2-player-mode-human-vs-human)
  - [Mode 3: Jupyter Notebook Interactive Lesson](#mode-3-jupyter-notebook-interactive-lesson)
- [Voice Position Reference Guide](#-voice-position-reference-guide)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## ✨ Features

- 🎙️ **Real-Time Voice & Click Control**: Speak position names (e.g. *"Center"*, *"Top Left"*, *"Pos 9"*) or click the board squares directly.
- 🤖 **Tactical AI Master Mode**: Powered by **Groq Llama-3.3-70b-versatile** or **OpenAI GPT-4o-mini** with function calling (`place_mark`). The AI strategically wins, blocks player moves, and speaks witty commentary.
- 👥 **2-Player Mode**: Supports two human players (Player 1 X vs Player 2 O) taking alternating turns with voice commands and audio prompts.
- 📜 **Left-Side Turn Log**: Real-time turn-by-turn match log showing exact positions and 1-indexed grid coordinates `[Row 1-3, Col 1-3]`.
- 🛡️ **Strict Turn Locking**: Inputs are disabled while AI is thinking/speaking to ensure strict turn alternation.
- 🔔 **Spoken Audio Reminders**: Automatic 10-second idle reminders if a player delays their turn.
- 🎯 **Visual Position Badges**: Small position numbers `1` through `9` rendered directly on board squares for 100% position alignment.

---

## 🗂️ Project Architecture & File Structure

```
Voice_APP/
├── README.md               # Complete documentation and setup guide
├── requirements.txt        # Python dependency specifications
├── .env                    # Environment variables (API Keys)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules for credentials & build files
├── L2.ipynb                # Interactive Jupyter Notebook Lesson
├── helpers.py              # Root wrapper for backward compatibility
├── run_app.py              # Root launcher for Human vs AI Mode
├── two_player_app.py       # Root launcher for 2-Player Human vs Human Mode
│
├── app/                    # Core Modular Application Package
│   ├── __init__.py         # Package Initializer
│   ├── helpers.py          # Voice AI Engine, Web Speech API & UI generator
│   ├── run_app.py          # Standalone Launcher for Human vs AI Mode
│   └── two_player_app.py   # Standalone Launcher for 2-Player Mode
│
└── agents/                 # AI Agent Definitions & Tool Schemas
    └── voice-app/
        ├── prompt.md       # AI Agent system prompt definition
        └── actions.json    # Client Actions / Function Calling schema
```

---

## 🛑 Prerequisites

- **Python**: Version `3.9` or higher.
- **Web Browser**: Google Chrome, Microsoft Edge, Brave, or Safari (supporting Web Speech API).
- **API Key**: 
  - **Groq API Key** (Recommended - Fast & Free): Get one from [console.groq.com](https://console.groq.com/)
  - *OR* **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com/)

---

## ⚙️ Step-by-Step Installation

### Step 1: Clone or Navigate to the Project Folder

Open your terminal or PowerShell and navigate to the project directory:

```powershell
cd "c:\Users\Abhisek kundu\Downloads\project\Voice_APP"
```

### Step 2: Create & Activate Virtual Environment (Optional but Recommended)

```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies

Install all dependencies listed in `requirements.txt`:

```powershell
pip install -r requirements.txt
```

---

## 🔑 Configuration (.env)

Create or edit the `.env` file in the root `Voice_APP` directory:

```env
# Groq API Key (Recommended - Ultra-fast Llama 3.3 70B inference)
GROQ_API_KEY="your_groq_api_key_here"

# OpenAI API Key (Optional fallback)
OPENAI_API_KEY="your_openai_api_key_here"
```

---

## 🚀 How to Run

### Mode 1: Human vs AI Mode (Web App)

Run the launcher for Human vs AI mode:

```powershell
python run_app.py
```

- Automatically opens **`http://localhost:8000`** in your browser.
- Click **🎤 Start Voice** and allow microphone access when prompted.
- Play against the Tactical AI Master using voice or clicks!

---

### Mode 2: 2-Player Mode (Human vs Human)

Run the launcher for 2 Human Players on the same computer:

```powershell
python two_player_app.py
```

- Automatically opens **`http://localhost:8001/two_player.html`** in your browser.
- Supports **Player 1 (X)** vs **Player 2 (O)** taking alternating turns using voice or clicks.

---

### Mode 3: Jupyter Notebook Interactive Lesson

If you prefer running inside VS Code or Jupyter:

1. Open **[Voice_APP/L2.ipynb](file:///c:/Users/Abhisek%20kundu/Downloads/project/Voice_APP/L2.ipynb)**.
2. Select your Python Kernel at the top right of the notebook editor.
3. Click **Run All** (or press `Shift + Enter` on each cell).
4. The interactive widget renders directly inside the notebook output pane!

---

## 🎯 Voice Position Reference Guide

The application uses **1-indexed human-friendly position numbers (1 to 9)** and **grid coordinates [Row 1-3, Col 1-3]**:

| Position Number | Spoken Voice Commands | Board Coordinates |
|:---:|---|:---:|
| **1** | *"Top Left"*, *"One"* | Row 1, Col 1 |
| **2** | *"Top Center"*, *"Top"*, *"Two"* | Row 1, Col 2 |
| **3** | *"Top Right"*, *"Three"* | Row 1, Col 3 |
| **4** | *"Middle Left"*, *"Left"*, *"Four"* | Row 2, Col 1 |
| **5** | *"Center"*, *"Middle"*, *"Five"* | Row 2, Col 2 |
| **6** | *"Middle Right"*, *"Right"*, *"Six"* | Row 2, Col 3 |
| **7** | *"Bottom Left"*, *"Seven"* | Row 3, Col 1 |
| **8** | *"Bottom Center"*, *"Bottom"*, *"Eight"* | Row 3, Col 2 |
| **9** | *"Bottom Right"*, *"Nine"* | Row 3, Col 3 |

---

## 🔧 Troubleshooting & FAQs

### Q1: Microphone is not connecting or speech is not recognized.
- **Solution**: Look at the left side of the address bar next to `http://localhost:8000`. Click the **Lock icon 🔒** or **Tune icon 🎛️**, set **Microphone** to **ALLOW**, and press `F5` to refresh.
- Check Windows Settings (`Win + I` ➔ **Privacy & Security** ➔ **Microphone**) and enable microphone access for web browsers.
- *Fallback*: You can always play by **clicking the board squares directly with your mouse**!

### Q2: I get `[Errno 2] No such file or directory` when running `python run_app.py`.
- **Solution**: Make sure your terminal directory is inside `Voice_APP`:
  ```powershell
  cd "c:\Users\Abhisek kundu\Downloads\project\Voice_APP"
  python run_app.py
  ```

### Q3: How do I switch between Groq and OpenAI backends?
- In `app/helpers.py` or `L2.ipynb`, change the provider parameter:
  - `voice_widget(provider="groq")` for Groq Llama 3.3.
  - `voice_widget(provider="openai")` for OpenAI GPT-4o.

---

## 👤 Author & Maintainer

Developed for real-time **Voice AI & Generative UI Applications**.

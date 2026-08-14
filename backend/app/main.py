"""FastAPI backend for the Voice Tic-Tac-Toe app.

Replaces the old http.server + client-side-exposed-API-key approach.
The frontend (React/Vite) calls POST /api/ai-move; this server calls
Groq/OpenAI with the real key, which never reaches the browser.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fastapi import WebSocket, WebSocketDisconnect
from app.rooms import room_manager

from app.helpers import call_ai_agent, load_env

load_env()

app = FastAPI(title="Voice Tic-Tac-Toe API")


# Allow the local Vite dev server to call this API during development.
# Tighten this to your real domain when you deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str


class AIMoveRequest(BaseModel):
    messages: List[Message]
    provider: str = "groq"
    model: Optional[str] = None


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/ai-move")
def ai_move(payload: AIMoveRequest) -> Dict[str, Any]:
    """Proxy endpoint: browser sends board/message state here instead of
    calling Groq/OpenAI directly, so the API key stays server-side."""
    try:
        messages = [m.model_dump() for m in payload.messages]
        result = call_ai_agent(
            messages=messages,
            provider=payload.provider,
            model=payload.model,
        )
        return result
    except ValueError as e:
        # Missing API key etc.
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI provider error: {e}")

@app.post("/api/rooms")
def create_room() -> Dict[str, str]:
    """Creates a new empty room and returns its code."""
    room = room_manager.create_room()
    return {"code": room.code}


@app.websocket("/ws/{room_code}")
async def room_websocket(websocket: WebSocket, room_code: str):
    room = room_manager.get_room(room_code)

    if room is None:
        await websocket.close(code=4004, reason="Room not found")
        return

    if room.is_full():
        await websocket.close(code=4001, reason="Room is full")
        return

    await websocket.accept()
    symbol = room.add_player(websocket)

    # Tell this player which symbol they were assigned
    await websocket.send_json({"type": "assigned", "symbol": symbol})

    # Broadcast the current state to everyone in the room (in case the 2nd player just joined)
    await broadcast_state(room)

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "move":
                index = data.get("index")
                moved = room.make_move(index, symbol)
                if moved:
                    await broadcast_state(room)

            elif data.get("type") == "reset":
                room.reset()
                await broadcast_state(room)

    except WebSocketDisconnect:
        room.remove_player(websocket)
        await broadcast_state(room)
        room_manager.delete_room_if_empty(room_code)


async def broadcast_state(room) -> None:
    state = room.state()
    for ws in list(room.players.values()):
        try:
            await ws.send_json(state)
        except Exception:
            pass  # connection may have just dropped; remove_player handles cleanup
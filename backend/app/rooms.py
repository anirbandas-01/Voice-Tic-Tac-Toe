"""In-memory room manager for online multiplayer.

Rooms are stored in memory only - if the server restarts, all active
games are lost. Fine for now; a database-backed version can come later
if you want games to survive server restarts.
"""
from __future__ import annotations

import random
import string
from typing import Dict, List, Optional

from fastapi import WebSocket


def generate_room_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=5))


class Room:
    def __init__(self, code: str):
        self.code = code
        self.squares: List[Optional[str]] = [None] * 9
        self.is_x_next: bool = True
        self.players: Dict[str, WebSocket] = {}  # {'X': websocket, 'O': websocket}

    def add_player(self, websocket: WebSocket) -> Optional[str]:
        """Assigns 'X' to the first player, 'O' to the second. Returns None if room is full."""
        if "X" not in self.players:
            self.players["X"] = websocket
            return "X"
        elif "O" not in self.players:
            self.players["O"] = websocket
            return "O"
        return None

    def remove_player(self, websocket: WebSocket) -> None:
        for symbol, ws in list(self.players.items()):
            if ws == websocket:
                del self.players[symbol]

    def is_full(self) -> bool:
        return len(self.players) >= 2

    def make_move(self, index: int, symbol: str) -> bool:
        """Returns True if the move was valid and applied."""
        expected_symbol = "X" if self.is_x_next else "O"
        if symbol != expected_symbol:
            return False
        if index < 0 or index > 8 or self.squares[index] is not None:
            return False

        self.squares[index] = symbol
        self.is_x_next = not self.is_x_next
        return True

    def reset(self) -> None:
        self.squares = [None] * 9
        self.is_x_next = True

    def state(self) -> dict:
        return {
            "type": "state",
            "squares": self.squares,
            "isXNext": self.is_x_next,
            "players": list(self.players.keys()),
        }


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}

    def create_room(self) -> Room:
        code = generate_room_code()
        while code in self.rooms:  # extremely unlikely, but avoid collisions
            code = generate_room_code()
        room = Room(code)
        self.rooms[code] = room
        return room

    def get_room(self, code: str) -> Optional[Room]:
        return self.rooms.get(code.upper())

    def delete_room_if_empty(self, code: str) -> None:
        room = self.rooms.get(code)
        if room and len(room.players) == 0:
            del self.rooms[code]


room_manager = RoomManager()
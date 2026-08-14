const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000'

export async function createRoom() {
  const response = await fetch(`${API_BASE}/api/rooms`, { method: 'POST' })
  if (!response.ok) throw new Error('Failed to create room')
  const data = await response.json()
  return data.code
}

export function connectToRoom(roomCode, handlers) {
  const ws = new WebSocket(`${WS_BASE}/ws/${roomCode}`)

  ws.onopen = () => {
    handlers.onOpen?.()
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'assigned') {
      handlers.onAssigned?.(data.symbol)
    } else if (data.type === 'state') {
      handlers.onState?.(data)
    }
  }

  ws.onclose = (event) => {
    handlers.onClose?.(event.code, event.reason)
  }

  ws.onerror = () => {
    handlers.onError?.()
  }

  return ws
}

export function sendMove(ws, index) {
  ws.send(JSON.stringify({ type: 'move', index }))
}

export function sendReset(ws) {
  ws.send(JSON.stringify({ type: 'reset' }))
}
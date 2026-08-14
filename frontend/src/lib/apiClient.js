const API_BASE = 'http://localhost:8000'

export async function getAIMove(squares) {
  const boardDescription = squares
    .map((val, i) => `Square ${i + 1}: ${val ? val : 'empty'}`)
    .join(', ')

  const messages = [
    {
      role: 'system',
      content:
        'You are playing Tic-Tac-Toe as O. The board has 9 squares numbered 1-9, ' +
        'arranged left-to-right, top-to-bottom (1=top-left, 5=center, 9=bottom-right). ' +
        'You will be told the current board state. You MUST call place_mark with the row (1-3) ' +
        'and col (1-3) of an EMPTY square. If you can win this turn, do it. ' +
        'Otherwise if the opponent can win next turn, block them. ' +
        'Otherwise play strategically.',
    },
    {
      role: 'user',
      content: `Current board: ${boardDescription}. It is your turn (O). Make your move.`,
    },
  ]

  const response = await fetch(`${API_BASE}/api/ai-move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, provider: 'groq' }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || `Server error: ${response.status}`)
  }

  const data = await response.json()
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]

  if (!toolCall) {
    throw new Error('AI did not return a move')
  }

  const args = JSON.parse(toolCall.function.arguments)
  const row = args.row // 1-3
  const col = args.col // 1-3
  const index = (row - 1) * 3 + (col - 1) // convert to 0-8

  if (index < 0 || index > 8 || squares[index]) {
    throw new Error('AI returned an invalid square')
  }

  return index
}


export function getRandomAvailableMove(squares) {
  const available = squares
    .map((val, i) => (val === null ? i : null))
    .filter((i) => i !== null)

if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}
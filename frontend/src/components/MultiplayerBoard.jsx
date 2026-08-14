import { useState, useEffect, useRef } from 'react'
import { connectToRoom, sendMove, sendReset } from '../lib/multiplayerClient'
import WinnerBadge from './WinnerBadge'
import { calculateWinner, isBoardFull } from '../lib/gameLogic'

function MultiplayerBoard({ roomCode, onLeaveRoom }) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [mySymbol, setMySymbol] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('connecting') // connecting | connected | error | full | not-found
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = connectToRoom(roomCode, {
      onOpen: () => setConnectionStatus('connected'),
      onAssigned: (symbol) => setMySymbol(symbol),
      onState: (data) => {
        setSquares(data.squares)
        setIsXNext(data.isXNext)
        setPlayerCount(data.players.length)
      },
      onClose: (code) => {
        if (code === 4004) setConnectionStatus('not-found')
        else if (code === 4001) setConnectionStatus('full')
        else setConnectionStatus('closed')
      },
      onError: () => setConnectionStatus('error'),
    })

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [roomCode])

  const winner = calculateWinner(squares)
  const isDraw = !winner && isBoardFull(squares)
  const isMyTurn = mySymbol === (isXNext ? 'X' : 'O')

  function handleClick(index) {
    if (!isMyTurn || squares[index] || winner || connectionStatus !== 'connected') return
    sendMove(wsRef.current, index)
  }

  function handleReset() {
    sendReset(wsRef.current)
  }

  if (connectionStatus === 'not-found') {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-400 text-lg">Room "{roomCode}" doesn't exist.</p>
        <button onClick={onLeaveRoom} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg">
          Back to Lobby
        </button>
      </div>
    )
  }

  if (connectionStatus === 'full') {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-400 text-lg">Room "{roomCode}" already has 2 players.</p>
        <button onClick={onLeaveRoom} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg">
          Back to Lobby
        </button>
      </div>
    )
  }

  let status
  if (connectionStatus === 'connecting') {
    status = 'Connecting...'
  } else if (playerCount < 2) {
    status = 'Waiting for another player to join...'
  } else if (winner) {
    status = winner === mySymbol ? 'You win!' : `${winner} wins!`
  } else if (isDraw) {
    status = "It's a draw!"
  } else {
    status = isMyTurn ? 'Your turn' : "Opponent's turn"
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
        <span className="text-slate-400 text-sm">Room Code:</span>
        <span className="text-white font-mono text-lg tracking-widest">{roomCode}</span>
        <button
          onClick={() => navigator.clipboard.writeText(roomCode)}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Copy
        </button>
      </div>

      {mySymbol && (
        <p className="text-slate-400">
          You are <span className="font-bold text-white">{mySymbol}</span>
        </p>
      )}

      <p className="text-white text-xl font-semibold">{status}</p>

      <div className="grid grid-cols-3 gap-3 w-80 h-80">
        {squares.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="bg-slate-800 hover:bg-slate-700 rounded-xl text-5xl font-bold text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            disabled={!isMyTurn || playerCount < 2}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Reset Game
        </button>
        <button
          onClick={onLeaveRoom}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Leave Room
        </button>
      </div>

      <WinnerBadge winner={winner} isDraw={isDraw} onReset={handleReset} />
    </div>
  )
}

export default MultiplayerBoard
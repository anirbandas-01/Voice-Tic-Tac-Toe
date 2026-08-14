import { useState } from 'react'
import { createRoom } from '../lib/multiplayerClient'

function RoomLobby({ onJoinRoom }) {
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setIsCreating(true)
    setError('')
    try {
      const code = await createRoom()
      onJoinRoom(code)
    } catch (err) {
      setError('Could not create room. Is the backend running?')
    } finally {
      setIsCreating(false)
    }
  }

  function handleJoin() {
    const trimmed = joinCode.trim().toUpperCase()
    if (trimmed.length !== 5) {
      setError('Room code should be 5 characters.')
      return
    }
    setError('')
    onJoinRoom(trimmed)
  }

  return (
    <div className="flex flex-col items-center gap-6 bg-slate-800 rounded-2xl p-8 w-96">
      <h2 className="text-2xl font-bold text-white">Play Online</h2>

      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
      >
        {isCreating ? 'Creating room...' : 'Create New Room'}
      </button>

      <div className="flex items-center gap-3 w-full">
        <div className="h-px bg-slate-600 flex-1" />
        <span className="text-slate-500 text-sm">OR</span>
        <div className="h-px bg-slate-600 flex-1" />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter room code"
          maxLength={5}
          className="bg-slate-900 text-white text-center text-lg tracking-widest uppercase rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 outline-none"
        />
        <button
          onClick={handleJoin}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Join Room
        </button>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  )
}

export default RoomLobby
import { useState } from 'react'
import Board from './components/Board'
import ModeSwitcher from './components/ModeSwitcher'
import VoiceLegend from './components/VoiceLegend'
import RoomLobby from './components/RoomLobby'
import MultiplayerBoard from './components/MultiplayerBoard'
import InstallButton from './components/InstallButton'
import { speak } from './lib/tts'


function App() {
  const [mode, setMode] = useState('ai')
  const [activeRoomCode, setActiveRoomCode] = useState(null)

  function handleModeChange(newMode) {
    setMode(newMode)
    setActiveRoomCode(null) // leave any active room when switching modes
    if (newMode === 'ai') {
      speak('Human versus AI mode activated.')
    } else if (newMode === 'human') {
      speak('Two player mode activated.')
    }
  }


  function handleJoinRoom(code) {
    setActiveRoomCode(code)
  }

  function handleLeaveRoom() {
    setActiveRoomCode(null)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 py-10">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Voice Tic-Tac-Toe</h1>
        <InstallButton />
      </div>
      <ModeSwitcher mode={mode} onChange={handleModeChange} />

      {mode === 'online' ? (
        activeRoomCode ? (
          <MultiplayerBoard
            key={activeRoomCode}
            roomCode={activeRoomCode}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <RoomLobby onJoinRoom={handleJoinRoom} />
        )
      ) : (
        <Board key={mode} mode={mode} />
      )}

      {mode !== 'online' && <VoiceLegend />}
    </div>
  )
}

export default App
import { useState, useRef, useEffect } from 'react'
import { calculateWinner, isBoardFull } from '../lib/gameLogic'
import { parseVoiceCommand } from '../lib/voiceParser'
import { getAIMove, getRandomAvailableMove } from '../lib/apiClient'
import WinnerBadge from './WinnerBadge'


function Board({ mode }) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const recognitionRef = useRef(null)

  const winner = calculateWinner(squares)
  const isDraw = !winner && isBoardFull(squares)
  const isAIMode = mode === 'ai'

  useEffect(() => {
    if (!isAIMode) return
    if (isXNext || winner || isDraw) return

    let cancelled = false
    setIsAIThinking(true)
    setVoiceStatus('')

    getAIMove(squares)
      .then((index) => {
        if (cancelled) return
        applyAIMove(index)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('AI move failed, falling back to random move:', err)
        const fallbackIndex = getRandomAvailableMove(squares)
        if (fallbackIndex !== null) {
          setVoiceStatus(`AI had an issue (${err.message}) — playing a fallback move.`)
          applyAIMove(fallbackIndex)
        } else {
          setVoiceStatus(`AI error: ${err.message}`)
          setIsXNext(true)
        }
      })
      .finally(() => {
        if (!cancelled) setIsAIThinking(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAIMode, isXNext, winner, isDraw, squares])

  function applyAIMove(index) {
    setSquares((prev) => {
      if (prev[index]) return prev
      const next = prev.slice()
      next[index] = 'O'
      return next
    })
    setIsXNext(true)
  }

  function placeMark(index) {
    if (squares[index] || winner) return
    if (isAIMode && (!isXNext || isAIThinking)) return // in AI mode, humans only place X

    const nextSquares = squares.slice()
    nextSquares[index] = isXNext ? 'X' : 'O'
    setSquares(nextSquares)
    setIsXNext(!isXNext)
  }

  function handleClick(index) {
    placeMark(index)
  }

  function handleReset() {
    setSquares(Array(9).fill(null))
    setIsXNext(true)
    setVoiceStatus('')
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceStatus('Voice input not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceStatus('Listening...')
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const index = parseVoiceCommand(transcript)

      if (index === null) {
        setVoiceStatus(`Didn't understand "${transcript}". Try "center" or "top left".`)
      } else {
        setVoiceStatus(`Heard "${transcript}" → placing mark`)
        placeMark(index)
      }
    }

    recognition.onerror = (event) => {
      setVoiceStatus(`Voice error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else if (isDraw) {
    status = "It's a draw!"
  } else if (isAIThinking) {
    status = 'AI is thinking...'
  } else if (isAIMode) {
    status = `Next turn: ${isXNext ? 'X (you)' : 'O (AI)'}`
  } else {
    status = `Next turn: ${isXNext ? 'X' : 'O'}`
  }

  const squaresDisabled = isAIThinking || (isAIMode && !isXNext)

 return (
  <div className="flex flex-col items-center gap-6">
    <p className="text-white text-xl font-semibold">{status}</p>

    <div className="grid grid-cols-3 gap-3 w-80 h-80">
      {squares.map((value, index) => (
        <button
          key={index}
          onClick={() => handleClick(index)}
          className="bg-slate-800 hover:bg-slate-700 rounded-xl text-5xl font-bold text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          disabled={squaresDisabled}
        >
          {value}
        </button>
      ))}
    </div>

    <div className="flex gap-3">
      <button
        onClick={startListening}
        disabled={isListening || isAIThinking}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        {isListening ? '🎤 Listening...' : '🎤 Speak your move'}
      </button>

      <button
        onClick={handleReset}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Reset Game
      </button>
    </div>

    {voiceStatus && (
      <p className="text-slate-400 text-sm">{voiceStatus}</p>
    )}

    <WinnerBadge winner={winner} isDraw={isDraw} onReset={handleReset} />
  </div>
)
}

export default Board
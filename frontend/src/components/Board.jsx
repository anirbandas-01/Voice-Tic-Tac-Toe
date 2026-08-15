import { useState, useRef, useEffect } from 'react'
import { calculateWinner, isBoardFull } from '../lib/gameLogic'
import { parseVoiceCommand } from '../lib/voiceParser'
import { getAIMove, getRandomAvailableMove } from '../lib/apiClient'
import { speak, isSpeakingActive, stopSpeech } from '../lib/tts'
import WinnerBadge from './WinnerBadge'

const POSITION_NAMES = {
  0: 'Top Left',
  1: 'Top Center',
  2: 'Top Right',
  3: 'Middle Left',
  4: 'Center',
  5: 'Middle Right',
  6: 'Bottom Left',
  7: 'Bottom Center',
  8: 'Bottom Right',
}

function Board({ mode }) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isListeningEnabled, setIsListeningEnabled] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)

  const recognitionRef = useRef(null)
  const isListeningEnabledRef = useRef(false)
  const isXNextRef = useRef(isXNext)
  const isAIThinkingRef = useRef(isAIThinking)
  const isGameOverRef = useRef(false)
  const isAIModeRef = useRef(mode === 'ai')

  const winner = calculateWinner(squares)
  const isDraw = !winner && isBoardFull(squares)
  const isAIMode = mode === 'ai'

  // Keep refs updated to prevent stale closures in Web Speech API handlers
  useEffect(() => {
    isListeningEnabledRef.current = isListeningEnabled
  }, [isListeningEnabled])

  useEffect(() => {
    isXNextRef.current = isXNext
  }, [isXNext])

  useEffect(() => {
    isAIThinkingRef.current = isAIThinking
  }, [isAIThinking])

  useEffect(() => {
    isAIModeRef.current = isAIMode
  }, [isAIMode])

  useEffect(() => {
    isGameOverRef.current = !!winner || isDraw
    if (winner || isDraw) {
      stopListening()
    }
  }, [winner, isDraw])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isListeningEnabledRef.current = false
      stopSpeech()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null
          recognitionRef.current.abort()
        } catch (e) {}
      }
    }
  }, [])

  // Auto-resume recognition when it becomes the human's turn in continuous mode
  useEffect(() => {
    const isHumanTurn = isAIMode ? isXNext : true
    if (isListeningEnabled && isHumanTurn && !isAIThinking && !winner && !isDraw && !isSpeakingActive()) {
      startRecognition()
    }
  }, [isListeningEnabled, isXNext, isAIThinking, winner, isDraw, isAIMode])

  useEffect(() => {
    if (!isAIMode) return
    if (isXNext || winner || isDraw) return

    let cancelled = false
    setIsAIThinking(true)
    setVoiceStatus('')

    getAIMove(squares)
      .then((index) => {
        if (cancelled) return
        const posName = POSITION_NAMES[index] || 'position'
        applyAIMove(index)

        const nextSquares = squares.slice()
        nextSquares[index] = 'O'
        const w = calculateWinner(nextSquares)
        const d = !w && isBoardFull(nextSquares)

        const aiMsg = `AI placed O at ${posName}.`

        if (w) {
          const endText = w === 'O' ? 'AI wins the game. Better luck next time.' : 'Congratulations! You win the game.'
          speak(`${aiMsg} ${endText}`)
        } else if (d) {
          speak(`${aiMsg} The game is a draw.`)
        } else {
          speak(`${aiMsg} Your turn. Please say your move.`, () => {
            if (canProcessVoice()) {
              startRecognition()
            }
          })
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('AI move failed, falling back to random move:', err)
        const fallbackIndex = getRandomAvailableMove(squares)
        if (fallbackIndex !== null) {
          const posName = POSITION_NAMES[fallbackIndex] || 'position'
          setVoiceStatus(`AI had an issue (${err.message}) — playing a fallback move.`)
          applyAIMove(fallbackIndex)
          speak(`AI placed O at ${posName}. Your turn. Please say your move.`, () => {
            if (canProcessVoice()) {
              startRecognition()
            }
          })
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
    stopListening()
    stopSpeech()
    setSquares(Array(9).fill(null))
    setIsXNext(true)
    setVoiceStatus('')
    speak('New game started.')
  }

  function canProcessVoice() {
    const isHumanTurn = isAIModeRef.current ? isXNextRef.current : true
    return (
      isListeningEnabledRef.current &&
      isHumanTurn &&
      !isAIThinkingRef.current &&
      !isGameOverRef.current &&
      !isSpeakingActive()
    )
  }

  function toggleListening() {
    if (isListeningEnabled) {
      stopListening()
    } else {
      setIsListeningEnabled(true)
      isListeningEnabledRef.current = true
      setVoiceStatus('Voice control activated. Listening for your move...')
      speak('Voice control activated. Your turn. Please say your move.', () => {
        if (canProcessVoice()) {
          startRecognition()
        }
      })
    }
  }

  function pauseRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch (e) {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  function stopListening() {
    isListeningEnabledRef.current = false
    setIsListeningEnabled(false)
    stopSpeech()
    pauseRecognition()
    setVoiceStatus('Voice listening stopped.')
  }

  function startRecognition() {
    if (!canProcessVoice()) {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceStatus('Voice input not supported in this browser. Try Chrome.')
      return
    }

    // Abort existing instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch (e) {}
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceStatus('Listening for your move...')
    }

    recognition.onresult = (event) => {
      if (!canProcessVoice()) return

      const transcript = event.results[0][0].transcript
      const index = parseVoiceCommand(transcript)

      if (index === null) {
        pauseRecognition()
        setVoiceStatus(`Didn't understand "${transcript}". Try "center" or "top left".`)
        speak('I did not understand that. Please try again.', () => {
          if (canProcessVoice()) {
            startRecognition()
          }
        })
        return
      }

      const posName = POSITION_NAMES[index] || 'that position'

      if (squares[index]) {
        pauseRecognition()
        setVoiceStatus(`${posName} is already occupied. Choose another position.`)
        speak(`${posName} is already occupied. Please choose another position.`, () => {
          if (canProcessVoice()) {
            startRecognition()
          }
        })
        return
      }

      // Valid move!
      pauseRecognition()
      const mark = isXNext ? 'X' : 'O'
      setVoiceStatus(`Heard "${transcript}" → placing ${mark} at ${posName}`)

      placeMark(index)

      const moveMsg = `You selected ${posName}. ${mark} placed at ${posName}.`

      const nextSquares = squares.slice()
      nextSquares[index] = mark
      const w = calculateWinner(nextSquares)
      const d = !w && isBoardFull(nextSquares)

      if (w) {
        const endText = w === 'X' ? 'Congratulations! You win the game.' : 'AI wins the game. Better luck next time.'
        speak(`${moveMsg} ${endText}`)
      } else if (d) {
        speak(`${moveMsg} The game is a draw.`)
      } else if (isAIMode) {
        speak(`${moveMsg} AI is thinking.`)
      } else {
        speak(`${moveMsg} Your turn. Please say your move.`, () => {
          if (canProcessVoice()) {
            startRecognition()
          }
        })
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopListening()
        setVoiceStatus(`Voice permission error: ${event.error}`)
      } else {
        setVoiceStatus(`Voice notice: ${event.error}`)
      }
    }

    recognition.onend = () => {
      if (canProcessVoice()) {
        setTimeout(() => {
          if (canProcessVoice() && recognitionRef.current === recognition) {
            try {
              recognition.start()
            } catch (err) {
              console.error('Failed to restart continuous listening:', err)
            }
          }
        }, 200)
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (err) {
      console.error('Error starting recognition:', err)
      setIsListening(false)
    }
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
          onClick={toggleListening}
          disabled={isAIThinking}
          className={`${
            isListeningEnabled
              ? 'bg-rose-600 hover:bg-rose-500 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500'
          } text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50`}
        >
          {isListeningEnabled ? '🔴 Continuous Listening (Click to Stop)' : '🎤 Speak your move'}
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
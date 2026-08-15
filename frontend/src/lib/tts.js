let isSpeaking = false

export function isSpeakingActive() {
  return isSpeaking
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {}
  }
  isSpeaking = false
}

export function speak(text, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd()
    return
  }

  try {
    window.speechSynthesis.cancel()
  } catch (e) {}

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.lang = 'en-US'

  isSpeaking = true

  let handled = false
  const finish = () => {
    if (handled) return
    handled = true
    isSpeaking = false
    if (onEnd) onEnd()
  }

  utterance.onend = finish
  utterance.onerror = (e) => {
    console.warn('TTS notice:', e)
    finish()
  }

  // Fallback safety timeout in case browser fails onend callback
  const estimatedDurationMs = Math.max(2000, text.length * 90)
  setTimeout(() => {
    if (!handled && isSpeaking) {
      finish()
    }
  }, estimatedDurationMs)

  try {
    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.error('SpeechSynthesis error:', err)
    finish()
  }
}

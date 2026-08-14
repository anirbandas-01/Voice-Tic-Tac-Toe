// Maps spoken phrases to board index (0-8)
const POSITION_MAP = {
  'top left': 0, 'top center': 1, 'top': 1, 'top right': 2,
  'middle left': 3, 'left': 3,
  'center': 4, 'middle': 4, 'middle center': 4,
  'right': 5, 'middle right': 5,
  'bottom left': 6,
  'bottom center': 7, 'bottom': 7,
  'bottom right': 8,
  'one': 0, 'two': 1, 'three': 2,
  'four': 3, 'five': 4, 'six': 5,
  'seven': 6, 'eight': 7, 'nine': 8,
}

export function parseVoiceCommand(transcript) {
  const cleaned = transcript.toLowerCase().trim()

  if (POSITION_MAP[cleaned] !== undefined) {
    return POSITION_MAP[cleaned]
  }

  // fallback: check if any known phrase is contained in what was heard
  for (const phrase in POSITION_MAP) {
    if (cleaned.includes(phrase)) {
      return POSITION_MAP[phrase]
    }
  }

  return null
}
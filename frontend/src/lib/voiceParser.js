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

// 9 Canonical board position commands for fuzzy matching
const CANONICAL_POSITIONS = [
  { phrase: 'top left', index: 0 },
  { phrase: 'top center', index: 1 },
  { phrase: 'top right', index: 2 },
  { phrase: 'middle left', index: 3 },
  { phrase: 'middle center', index: 4 },
  { phrase: 'middle right', index: 5 },
  { phrase: 'bottom left', index: 6 },
  { phrase: 'bottom center', index: 7 },
  { phrase: 'bottom right', index: 8 },
]

// Common speech-recognition mishears and homophones map
const WORD_REPLACEMENTS = {
  'lift': 'left',
  'lyft': 'left',
  'write': 'right',
  'wright': 'right',
  'rite': 'right',
  'botom': 'bottom',
  'bottem': 'bottom',
  'botton': 'bottom',
  'batom': 'bottom',
  'midle': 'middle',
  'midel': 'middle',
  'centar': 'center',
  'centre': 'center',
  'topp': 'top',
}

const CONFIDENCE_THRESHOLD = 0.75

function levenshteinDistance(a, b) {
  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1.0
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1.0
  const dist = levenshteinDistance(str1, str2)
  const charSim = 1.0 - dist / maxLen

  const tokens1 = str1.split(/\s+/)
  const tokens2 = str2.split(/\s+/)
  if (tokens1.length === tokens2.length && tokens1.length > 0) {
    let tokenSimSum = 0
    for (let i = 0; i < tokens1.length; i++) {
      const t1 = tokens1[i]
      const t2 = tokens2[i]
      const tMaxLen = Math.max(t1.length, t2.length)
      const tSim = tMaxLen === 0 ? 1.0 : 1.0 - levenshteinDistance(t1, t2) / tMaxLen
      tokenSimSum += tSim
    }
    const tokenSim = tokenSimSum / tokens1.length
    return Math.max(charSim, tokenSim)
  }

  return charSim
}

function normalizeTranscript(transcript) {
  let text = transcript.toLowerCase().replace(/[-_.,!?]/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean)
  const normalizedWords = words.map(w => WORD_REPLACEMENTS[w] || w)
  return normalizedWords.join(' ')
}

export function parseVoiceCommand(transcript) {
  if (!transcript || typeof transcript !== 'string') return null

  const cleaned = transcript.toLowerCase().trim()

  // Priority 1: Existing Exact Match (unchanged)
  if (POSITION_MAP[cleaned] !== undefined) {
    return POSITION_MAP[cleaned]
  }

  // Priority 2: Normalization (phonetic mishears & punctuation)
  const normalized = normalizeTranscript(transcript)

  if (POSITION_MAP[normalized] !== undefined) {
    return POSITION_MAP[normalized]
  }

  // Priority 3: Containment check for multi-word phrases
  for (const phrase in POSITION_MAP) {
    if (phrase.includes(' ') && normalized.includes(phrase)) {
      return POSITION_MAP[phrase]
    }
  }

  // Priority 4: Fallback Fuzzy Matching against 9 canonical board positions
  let bestMatch = null
  let highestScore = 0

  for (const pos of CANONICAL_POSITIONS) {
    const score = calculateSimilarity(normalized, pos.phrase)
    if (score > highestScore) {
      highestScore = score
      bestMatch = pos
    }
  }

  if (bestMatch && highestScore >= CONFIDENCE_THRESHOLD) {
    return bestMatch.index
  }

  // Priority 5: Exact single-word match for standalone words
  const normalizedTokens = normalized.split(/\s+/)
  if (normalizedTokens.length === 1 && POSITION_MAP[normalizedTokens[0]] !== undefined) {
    return POSITION_MAP[normalizedTokens[0]]
  }

  return null
}
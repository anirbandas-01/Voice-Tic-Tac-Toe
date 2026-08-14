import { useState } from 'react'

const LEGEND_LAYOUT = [
  'Top Left', 'Top Center', 'Top Right',
  'Left', 'Center', 'Right',
  'Bottom Left', 'Bottom Center', 'Bottom Right',
]

function VoiceLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 w-64 mb-2 shadow-xl">
          <p className="text-slate-300 text-sm font-semibold mb-2 text-center">
            Say a position:
          </p>
          <div className="grid grid-cols-3 gap-1">
            {LEGEND_LAYOUT.map((label) => (
              <div
                key={label}
                className="bg-slate-700 rounded-md text-center text-xs text-slate-300 py-2 px-1"
              >
                {label}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-2">
            You can also say numbers 1–9
          </p>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-700 hover:bg-slate-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-xl font-bold ml-auto"
      >
        {isOpen ? '✕' : '?'}
      </button>
    </div>
  )
}

export default VoiceLegend
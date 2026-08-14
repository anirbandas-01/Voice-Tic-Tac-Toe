function ModeSwitcher({ mode, onChange }) {
  const modes = [
    { id: 'ai', label: 'Human vs AI' },
    { id: 'human', label: 'Human vs Human' },
    { id: 'online', label: 'Play Online' },
  ]

  return (
    <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === m.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export default ModeSwitcher
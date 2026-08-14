function WinnerBadge({ winner, isDraw, onReset }) {
  if (!winner && !isDraw) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl">
        {winner ? (
          <>
            <div className="text-6xl">{winner === 'X' ? '❌' : '⭕'}</div>
            <h2 className="text-3xl font-bold text-white">{winner} Wins!</h2>
          </>
        ) : (
          <>
            <div className="text-6xl">🤝</div>
            <h2 className="text-3xl font-bold text-white">It's a Draw!</h2>
          </>
        )}
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors mt-2"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default WinnerBadge
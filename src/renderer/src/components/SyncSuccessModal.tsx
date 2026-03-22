import { useEffect, useState } from 'react'

interface SyncSuccessModalProps {
  tracksCopied: number
  tracksSkipped: number
  removed: number
  errors: string[]
  onClose: () => void
}

const CTAS = [
  {
    label: 'Star us on GitHub',
    url: 'https://github.com/oriaflow-labs/jellytunes',
  },
  {
    label: 'Report issues or suggest features',
    url: 'https://github.com/oriaflow-labs/jellytunes/issues',
  },
  {
    label: 'Support development on Ko-fi ☕',
    url: 'https://ko-fi.com/oriaflowlabs',
  },
]

export function SyncSuccessModal({
  tracksCopied,
  tracksSkipped,
  removed,
  errors,
  onClose,
}: SyncSuccessModalProps): JSX.Element {
  const [cta] = useState(() => CTAS[Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % CTAS.length])
  const success = errors.length === 0 || tracksCopied > 0

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{success ? '✓' : '✗'}</span>
          <h2 className="text-lg font-semibold">{success ? 'Sync complete' : 'Sync failed'}</h2>
        </div>

        {success ? (
          <div className="text-sm text-zinc-400 space-y-1 mb-5">
            {tracksCopied > 0 && <p>Copied: <span className="text-zinc-200">{tracksCopied} tracks</span></p>}
            {tracksSkipped > 0 && <p>Skipped (up-to-date): <span className="text-zinc-200">{tracksSkipped}</span></p>}
            {removed > 0 && <p>Removed: <span className="text-zinc-200">{removed} items</span></p>}
            {errors.length > 0 && <p>Errors: <span className="text-red-400">{errors.length}</span></p>}
          </div>
        ) : (
          <div className="text-sm text-red-400 mb-5 space-y-1">
            {errors.slice(0, 3).map((e, i) => <p key={i}>{e}</p>)}
            {errors.length > 3 && <p className="text-zinc-500">+{errors.length - 3} more</p>}
          </div>
        )}

        {success && (
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.open(cta.url) }}
            className="block w-full text-center px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors mb-2"
          >
            {cta.label}
          </a>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

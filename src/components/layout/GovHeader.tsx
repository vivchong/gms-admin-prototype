export function GovHeader() {
  return (
    <div className="w-full bg-neutral-100 border-b border-neutral-200 px-6 py-1.5 flex items-center gap-2 text-xs text-neutral-700">
      <svg width="12" height="12" viewBox="0 0 12 12" className="text-red-600 flex-shrink-0">
        <polygon points="6,0 12,12 0,12" fill="currentColor" />
      </svg>
      <span>A Singapore Government Agency Website</span>
      <a href="#" className="ml-1 text-neutral-900 underline underline-offset-2">
        How to identify
      </a>
    </div>
  )
}

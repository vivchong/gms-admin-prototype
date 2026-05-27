import { ChevronDown } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="w-full bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-900 leading-tight">GMS</span>
          <span className="text-[10px] text-neutral-500 leading-tight tracking-wide uppercase">
            Games Management System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-full text-sm text-neutral-700 hover:bg-neutral-50">
          Pesta Sukan 2027
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
        </button>

        <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">AT</span>
        </div>
      </div>
    </header>
  )
}

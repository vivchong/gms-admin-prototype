import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  label: string
  children: React.ReactNode
}

function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2 mt-6">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-2/3 rounded-md" />
      </div>
    </div>
  )
}

export function PreviewPanel({ label, children }: Props) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700">Preview</h3>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className="border border-dashed border-neutral-300 rounded-xl bg-neutral-50">
        <div className="p-5">
          {loading ? <PreviewSkeleton /> : children}
        </div>
      </div>
    </div>
  )
}

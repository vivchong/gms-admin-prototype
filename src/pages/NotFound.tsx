import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="border-neutral-200 max-w-sm w-full">
        <CardContent className="p-8 text-center">
          <p className="text-4xl font-semibold text-neutral-300 mb-4">404</p>
          <p className="text-sm text-neutral-700 mb-1">Page not found</p>
          <p className="text-xs text-neutral-500 mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button onClick={() => navigate('/')}>
            Go back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

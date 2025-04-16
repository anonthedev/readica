import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center gap-4">
      <h2 className="text-3xl font-bold">Page Not Found</h2>
      <p className="text-lg text-muted-foreground">Could not find the requested resource.</p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
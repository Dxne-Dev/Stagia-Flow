import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpgradeBannerProps {
  message: string
  className?: string
}

export default function UpgradeBanner({ message, className }: UpgradeBannerProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-primary" />
          </div>
          <p className="text-sm">{message}</p>
        </div>
        <Button size="sm" asChild>
          <a href="#pricing">Passer à Pro</a>
        </Button>
      </CardContent>
    </Card>
  )
}

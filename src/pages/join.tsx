import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionName, setSessionName] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchSession = async () => {
      if (!token) return
      const { data } = await supabase.from('sessions').select('name, organization_id').eq('invite_token', token).maybeSingle()
      if (data) setSessionName(data.name)
    }
    fetchSession()
  }, [token])

  const handleJoin = async () => {
    if (!user || !token) return
    setLoading(true)
    setError(null)
    try {
      const { data: session } = await supabase.from('sessions').select('id, organization_id').eq('invite_token', token).maybeSingle()
      if (!session) throw new Error('Lien d\'invitation invalide ou expiré')

      await supabase.from('user_profiles').upsert({
        id: user.id,
        session_id: session.id,
        organization_id: session.organization_id,
        role: 'stagiaire',
      })

      await refreshProfile()
      navigate('/my-brief')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la jonction')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate(`/login?redirect=/join/${token}`)
    return null
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Users className="size-6 text-primary" />
          </div>
          <CardTitle>Rejoindre une session</CardTitle>
          {sessionName && (
            <CardDescription>Vous avez été invité à rejoindre : <strong>{sessionName}</strong></CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          <Button onClick={handleJoin} disabled={loading} className="w-full">
            {loading && <Spinner className="mr-2" />}
            Rejoindre la session
          </Button>
          <Button variant="outline" onClick={() => navigate('/my-brief')} className="w-full">
            Aller à mon espace
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

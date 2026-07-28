import * as React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Users, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldLabel } from '@/components/ui/field'
import { isLimitError } from '@/lib/plan-utils'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [joining, setJoining] = React.useState(false)
  const [signingUp, setSigningUp] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionName, setSessionName] = React.useState<string | null>(null)
  const [orgName, setOrgName] = React.useState<string | null>(null)
  const [sessionExists, setSessionExists] = React.useState(true)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [sessionOrgId, setSessionOrgId] = React.useState<string | null>(null)
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    const fetchSession = async () => {
      if (!token) { setSessionExists(false); return }
      const { data } = await supabase.from('sessions').select('id, name, organization_id').eq('invite_token', token).maybeSingle()
      if (data) {
        setSessionName(data.name)
        setSessionId(data.id)
        setSessionOrgId(data.organization_id)
        const { data: org } = await supabase.from('organizations').select('name').eq('id', data.organization_id).maybeSingle()
        if (org) setOrgName(org.name)
      } else {
        setSessionExists(false)
      }
    }
    fetchSession()
  }, [token])

  const handleJoin = async () => {
    if (!user || !sessionId || !sessionOrgId) return
    setJoining(true)
    setError(null)
    try {
      if (!sessionId || !sessionOrgId) throw new Error('Lien d\'invitation invalide ou expiré')

      await supabase.from('user_profiles').upsert({
        id: user.id,
        session_id: sessionId,
        organization_id: sessionOrgId,
        role: 'stagiaire',
      })

      await refreshProfile()
      navigate('/my-brief')
    } catch (e: unknown) {
      const msg = isLimitError(e)
      setError(msg ?? (e instanceof Error ? e.message : 'Erreur lors de la jonction'))
    } finally {
      setJoining(false)
    }
  }

  const handleSignUpAndJoin = async () => {
    if (!token || !fullName.trim() || !email.trim() || !password) return
    setSigningUp(true)
    setError(null)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (signUpError) throw signUpError

      if (data?.session) {
        await handleJoin()
      } else {
        navigate(`/confirm-email?redirect=/join/${token}`)
      }
    } catch (e: unknown) {
      const msg = isLimitError(e)
      setError(msg ?? (e instanceof Error ? e.message : 'Une erreur est survenue'))
    } finally {
      setSigningUp(false)
    }
  }

  if (!sessionExists) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <Users className="size-6 text-destructive" />
            </div>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>Ce lien d'invitation est invalide ou a expiré.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
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
            <CardDescription>
              Vous avez été invité par <strong>{orgName ?? 'une organisation'}</strong> pour la session <strong>{sessionName}</strong>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {user ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Connecté en tant que <strong>{user.email}</strong>
              </p>
              <Button onClick={handleJoin} disabled={joining} className="w-full">
                {joining && <Spinner className="mr-2" />}
                Rejoindre la session
              </Button>
              <Button variant="outline" onClick={() => navigate('/my-brief')} className="w-full">
                Aller à mon espace
              </Button>
            </>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="fullName">Nom complet</FieldLabel>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Marie Dupont" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@entreprise.fr" />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pr-9" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              <Button onClick={handleSignUpAndJoin} disabled={signingUp || !fullName.trim() || !email.trim() || !password} className="w-full">
                {signingUp && <Spinner className="mr-2" />}
                Créer un compte et rejoindre
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link to={`/login?redirect=/join/${token}`} className="text-primary underline-offset-4 hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
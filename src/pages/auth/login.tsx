import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import Prism from '@/components/ui/prism'
import { LogoIcon } from '@/components/ui/logo-icon'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (signInError) throw signInError
      navigate(redirectTo)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0a0a0f]">
      <Prism animationType="rotate" timeScale={0.4} glow={1.2} noise={0.2} scale={4} colorFrequency={1.5} bloom={1.2} />

      <Link to="/" className="fixed left-6 top-6 z-20 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white/90">
          <LogoIcon className="size-full object-contain" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">StagePilot</span>
      </Link>

      <div className="relative z-10 flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Connexion</GlassCardTitle>
              <GlassCardDescription>Accédez à votre espace StagePilot</GlassCardDescription>
            </GlassCardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GlassCardContent className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input {...field} id="email" type="email" placeholder="marie@entreprise.fr" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                        <Link to="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <Input {...field} id="password" type="password" placeholder="••••••••" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </GlassCardContent>
              <GlassCardFooter className="gap-3 pt-8">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Spinner className="mr-2" />}
                  Se connecter
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-1">
                  Pas encore de compte ?{' '}
                  <Link to={`/signup${redirectTo !== '/dashboard' ? `?redirect=${redirectTo}` : ''}`} className="text-primary underline-offset-4 hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </GlassCardFooter>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

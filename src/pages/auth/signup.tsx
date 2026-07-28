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

const schema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.fullName } },
      })
      if (signUpError) throw signUpError
      navigate(`/confirm-email${redirectTo ? `?redirect=${redirectTo}` : ''}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0a0a0f]">
      <Prism animationType="rotate" timeScale={0.4} glow={1.2} noise={0.2} scale={4} colorFrequency={1.5} bloom={1.2} />

      <Link to="/" className="fixed left-6 top-6 z-20 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white/90">
          <span className="text-sm font-bold text-[#0a0a0f]">SP</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">StagePilot</span>
      </Link>

      <div className="relative z-10 flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Créer un compte</GlassCardTitle>
              <GlassCardDescription>Commencez à structurer vos stages en moins de 5 minutes</GlassCardDescription>
            </GlassCardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GlassCardContent className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="fullName">Nom complet</FieldLabel>
                      <Input {...field} id="fullName" placeholder="Marie Dupont" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email professionnel</FieldLabel>
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
                      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                      <Input {...field} id="password" type="password" placeholder="••••••••" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </GlassCardContent>
              <GlassCardFooter className="gap-3 pt-8">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Spinner className="mr-2" />}
                  Créer mon compte
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{' '}
                  <Link to={`/login${redirectTo ? `?redirect=${redirectTo}` : ''}`} className="text-primary underline-offset-4 hover:underline">
                    Se connecter
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

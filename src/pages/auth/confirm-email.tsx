import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''
  const loginUrl = `/login${redirectTo ? `?redirect=${redirectTo}` : ''}`
  const signupUrl = `/signup${redirectTo ? `?redirect=${redirectTo}` : ''}`

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold tracking-tight">StagePilot</span>
          </div>
          <p className="text-sm text-muted-foreground">Du premier jour à la remise du rapport</p>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 size-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="size-7 text-primary" />
            </div>
            <CardTitle className="text-center">Vérifiez votre boîte mail</CardTitle>
            <CardDescription className="text-center">
              Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Vous pouvez fermer cette fenêtre. Une fois votre email confirmé,
              connectez-vous pour configurer votre organisation.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to={loginUrl}>
                Aller à la connexion
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
              {' '}<Link to={signupUrl} className="text-primary underline-offset-4 hover:underline">réessayez</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
import * as React from 'react'
import { Save, Globe, User, Building2, Mail, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import type { Organization } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [org, setOrg] = React.useState<Organization | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingOrg, setSavingOrg] = React.useState(false)
  const [fullName, setFullName] = React.useState('')
  const [orgName, setOrgName] = React.useState('')
  const [orgUrl, setOrgUrl] = React.useState('')
  const [profileMessage, setProfileMessage] = React.useState<string | null>(null)
  const [orgMessage, setOrgMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      setFullName(profile?.full_name ?? '')
      if (!profile?.organization_id) { setLoading(false); return }
      const { data } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).maybeSingle()
      if (data) {
        setOrg(data)
        setOrgName(data.name)
        setOrgUrl(data.website_url ?? '')
      }
      setLoading(false)
    }
    load()
  }, [profile])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage(null)
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName.trim() || null })
      .eq('id', user!.id)
    if (error) {
      setProfileMessage('Erreur lors de la sauvegarde')
    } else {
      setProfileMessage('Profil mis à jour')
      await refreshProfile()
    }
    setSavingProfile(false)
  }

  const handleSaveOrg = async () => {
    if (!org) return
    setSavingOrg(true)
    setOrgMessage(null)
    const { data, error } = await supabase
      .from('organizations')
      .update({ name: orgName.trim(), website_url: orgUrl.trim() || null })
      .eq('id', org.id)
      .select()
      .single()
    if (error) {
      setOrgMessage('Erreur lors de la sauvegarde')
    } else {
      setOrgMessage('Organisation mise à jour')
      if (data) setOrg(data)
    }
    setSavingOrg(false)
  }

  const roleLabel: Record<string, string> = {
    admin: 'Administrateur',
    manager: 'Gestionnaire',
    stagiaire: 'Stagiaire',
  }

  if (loading) return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gérez vos informations personnelles et celles de votre organisation</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Informations personnelles</CardTitle>
              <CardDescription>Nom et coordonnées de votre compte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="email" value={user?.email ?? ''} className="pl-9" readOnly />
            </div>
            <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
          </Field>
          <Field>
            <FieldLabel htmlFor="fullName">Nom complet</FieldLabel>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Votre nom"
            />
          </Field>
          <Field>
            <FieldLabel>Rôle</FieldLabel>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <Badge variant="secondary">{roleLabel[profile?.role ?? ''] ?? profile?.role ?? '—'}</Badge>
            </div>
          </Field>
          {profileMessage && (
            <p className={`text-sm ${profileMessage === 'Profil mis à jour' ? 'text-emerald-600' : 'text-destructive'}`}>
              {profileMessage}
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              <Save className="size-4" />
              {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {org && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Organisation</CardTitle>
                <CardDescription>Nom et site web de votre entreprise</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="orgName">Nom de l'organisation</FieldLabel>
              <Input
                id="orgName"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="orgUrl">Site web</FieldLabel>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="orgUrl"
                  value={orgUrl}
                  onChange={e => setOrgUrl(e.target.value)}
                  className="pl-9"
                  placeholder="https://"
                />
              </div>
            </Field>
            {orgMessage && (
              <p className={`text-sm ${orgMessage === 'Organisation mise à jour' ? 'text-emerald-600' : 'text-destructive'}`}>
                {orgMessage}
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveOrg} disabled={savingOrg}>
                <Save className="size-4" />
                {savingOrg ? 'Enregistrement...' : 'Enregistrer l\'organisation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
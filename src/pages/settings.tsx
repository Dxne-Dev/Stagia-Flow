import * as React from 'react'
import { Save, Globe, User, Building2, Mail, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useOrganization, useUpdateOrganization } from '@/hooks'
import { profileService } from '@/services'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { data: org, isLoading } = useOrganization(profile?.organization_id)
  const updateOrg = useUpdateOrganization()
  const [loading, setLoading] = React.useState(true)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingOrg, setSavingOrg] = React.useState(false)
  const [fullName, setFullName] = React.useState('')
  const [orgName, setOrgName] = React.useState('')
  const [orgUrl, setOrgUrl] = React.useState('')
  const [profileMessage, setProfileMessage] = React.useState<string | null>(null)
  const [orgMessage, setOrgMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setFullName(profile?.full_name ?? '')
    if (org) {
      setOrgName(org.name)
      setOrgUrl(org.website_url ?? '')
    }
    if (!isLoading) setLoading(false)
  }, [profile, org, isLoading])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage(null)
    await profileService.update(user!.id, { full_name: fullName.trim() || null })
    setProfileMessage('Profil mis à jour')
    await refreshProfile()
    setSavingProfile(false)
  }

  const handleSaveOrg = async () => {
    if (!org) return
    setSavingOrg(true)
    setOrgMessage(null)
    await updateOrg.mutateAsync({ id: org.id, name: orgName.trim(), website_url: orgUrl.trim() || null })
    setOrgMessage('Organisation mise à jour')
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
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{profile?.role === 'stagiaire' ? 'Gérez vos informations personnelles' : 'Gérez vos informations personnelles et celles de votre organisation'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 rounded-xl border bg-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <p className="text-base font-medium">{user?.email ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Lecture seule</p>
          </div>
        </div>

        <div className="col-span-1 rounded-xl border bg-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rôle</span>
          </div>
          <div className="flex-1 flex items-center">
            <Badge variant="secondary" className="text-sm px-3 py-1">{roleLabel[profile?.role ?? ''] ?? profile?.role ?? '—'}</Badge>
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl border bg-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nom complet</span>
          </div>
          <Input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Votre nom"
            className="h-10 text-base"
          />
          {profileMessage && (
            <p className={`text-sm ${profileMessage === 'Profil mis à jour' ? 'text-emerald-600' : 'text-destructive'}`}>
              {profileMessage}
            </p>
          )}
          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              <Save className="size-4" />
              {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </Button>
          </div>
        </div>

        {profile?.role !== 'stagiaire' && (
          <div className="md:col-span-2 rounded-xl border bg-card p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Organisation</span>
            </div>
            {org ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Nom</span>
                  <Input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Nom de votre entreprise"
                    className="h-10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Site web</span>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={orgUrl}
                      onChange={e => setOrgUrl(e.target.value)}
                      className="pl-9 h-10"
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  {orgMessage && (
                    <p className={`text-sm mb-3 ${orgMessage === 'Organisation mise à jour' ? 'text-emerald-600' : 'text-destructive'}`}>
                      {orgMessage}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button onClick={handleSaveOrg} disabled={savingOrg}>
                      <Save className="size-4" />
                      {savingOrg ? 'Enregistrement...' : "Enregistrer l'organisation"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Aucune organisation associée</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

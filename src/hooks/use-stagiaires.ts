import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services'

export function useStagiaires(organizationId: string | null | undefined, page = 0) {
  return useQuery({
    queryKey: ['stagiaires', organizationId, page],
    queryFn: () => profileService.getStagiairesByOrgId(organizationId!, page),
    enabled: !!organizationId,
  })
}

export function useAssignSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string | null }) =>
      profileService.assignSession(userId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services'
import type { Session } from '@/types'

export function useSessions(organizationId: string | null | undefined, page = 0) {
  return useQuery({
    queryKey: ['sessions', organizationId, page],
    queryFn: () => sessionService.getByOrgId(organizationId!, page),
    enabled: !!organizationId,
  })
}

export function useSessionsList(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: ['sessions', 'all', organizationId],
    queryFn: () => sessionService.getAllByOrgId(organizationId!),
    enabled: !!organizationId,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sessionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sessionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useSession(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getById(sessionId!),
    enabled: !!sessionId,
  })
}

export type { Session }

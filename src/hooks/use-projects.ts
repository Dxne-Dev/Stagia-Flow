import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/services'
import type { ProjectStatus } from '@/types'

export function useProjects(sessionIds: string[], page = 0) {
  return useQuery({
    queryKey: ['projects', sessionIds, page],
    queryFn: () => projectService.getBySessionIds(sessionIds, page),
    enabled: sessionIds.length > 0,
  })
}

export function useRecentProjects(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: ['projects', 'recent', organizationId],
    queryFn: () => projectService.getRecentByOrgId(organizationId!),
    enabled: !!organizationId,
  })
}

export function useSessionProjects(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['projects', 'session', sessionId],
    queryFn: () => projectService.getBySessionId(sessionId!),
    enabled: !!sessionId,
  })
}

export function useActiveProjects(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['projects', 'active', sessionId],
    queryFn: () => projectService.getActiveBySessionId(sessionId!),
    enabled: !!sessionId,
  })
}

export function useSessionProjectsNonArchived(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['projects', 'nonarchived', sessionId],
    queryFn: () => projectService.getBySessionIdNonArchived(sessionId!),
    enabled: !!sessionId,
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      projectService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

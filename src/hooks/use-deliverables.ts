import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliverableService } from '@/services'
import type { DeliverableStatus } from '@/types'

export function useMyDeliverable(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['deliverable', 'mine', userId],
    queryFn: () => deliverableService.getByUserId(userId!),
    enabled: !!userId,
  })
}

export function useMyDeliverables(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['deliverables', 'mine', userId],
    queryFn: () => deliverableService.getByUserIdWithProject(userId!),
    enabled: !!userId,
  })
}

export function usePendingDeliverables(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: ['deliverables', 'pending', organizationId],
    queryFn: () => deliverableService.getPendingByOrgId(organizationId!),
    enabled: !!organizationId,
  })
}

export function useDeliverablesReview(organizationId: string | null | undefined, page = 0) {
  return useQuery({
    queryKey: ['deliverables', 'review', organizationId, page],
    queryFn: () => deliverableService.getByOrgIdWithDetails(organizationId!, page),
    enabled: !!organizationId,
  })
}

export function useUpdateDeliverableStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reviewedBy }: { id: string; status: DeliverableStatus; reviewedBy: string }) =>
      deliverableService.updateStatus(id, status, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverable'] })
      queryClient.invalidateQueries({ queryKey: ['deliverables'] })
    },
  })
}

export function useUploadDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      deliverableService.uploadFile(file, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverable'] })
      queryClient.invalidateQueries({ queryKey: ['deliverables'] })
    },
  })
}

export function useSubmitDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deliverable: {
      project_id: string
      user_id: string
      file_url: string | null
      notes: string | null
    }) => deliverableService.create(deliverable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverable'] })
      queryClient.invalidateQueries({ queryKey: ['deliverables'] })
    },
  })
}

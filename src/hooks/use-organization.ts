import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '@/services'
import type { Organization } from '@/types'

export function useOrganization(orgId: string | null | undefined) {
  return useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationService.getById(orgId!),
    enabled: !!orgId,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Pick<Organization, 'name' | 'website_url' | 'ai_context_json'>>) =>
      organizationService.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', id] })
    },
  })
}

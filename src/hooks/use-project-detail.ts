import { useQuery } from '@tanstack/react-query'
import { projectService } from '@/services'

export function useProjectDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id!),
    enabled: !!id,
  })
}

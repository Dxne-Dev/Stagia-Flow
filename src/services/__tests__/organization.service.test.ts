import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import { organizationService } from '../organization.service'

describe('organizationService', () => {
  it('exports service object with expected methods', () => {
    expect(organizationService).toBeDefined()
    expect(organizationService.getById).toBeInstanceOf(Function)
    expect(organizationService.create).toBeInstanceOf(Function)
    expect(organizationService.update).toBeInstanceOf(Function)
  })

  it('getById calls supabase with correct table', async () => {
    const { supabase } = await import('@/lib/supabase')
    await organizationService.getById('test-id')
    expect(supabase.from).toHaveBeenCalledWith('organizations')
  })
})

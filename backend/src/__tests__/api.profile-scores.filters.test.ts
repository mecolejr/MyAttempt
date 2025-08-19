import request from 'supertest'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockPrisma: any = {
  location: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  hateCrime: {
    groupBy: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  crimeStats: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  demographics: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
}

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      return mockPrisma
    }
  },
}))

const { default: app } = await import('../index')

describe('profile-scores filters: state and q', () => {
  beforeEach(() => {
    mockPrisma.location.findMany.mockResolvedValue([
      { id: 1, name: 'Texas', state: 'TX', hateCrimeIndex: 0.3, diversityIndex: 0.5, crimeRate: 0.4 },
      { id: 2, name: 'Utah', state: 'UT', hateCrimeIndex: 0.2, diversityIndex: 0.3, crimeRate: 0.3 },
    ])
    mockPrisma.location.count.mockResolvedValue(2)
    mockPrisma.hateCrime.groupBy.mockResolvedValue([])
    mockPrisma.hateCrime.count.mockResolvedValue(0)
    mockPrisma.hateCrime.aggregate.mockResolvedValue({ _sum: { incidents: 0 } })
    mockPrisma.crimeStats.count.mockResolvedValue(0)
    mockPrisma.crimeStats.aggregate.mockResolvedValue({ _sum: { violentRate: 0, propertyRate: 0 } })
    mockPrisma.demographics.count.mockResolvedValue(0)
    mockPrisma.demographics.aggregate.mockResolvedValue({ _max: { updatedAt: new Date() } })
  })

  it('filters by state', async () => {
    const res = await request(app).get('/api/profile-scores').query({ state: 'TX' }).expect(200)
    const names = res.body.results.map((r: any) => r.name)
    expect(names).toEqual(['Texas'])
  })

  it('filters by query q', async () => {
    const res = await request(app).get('/api/profile-scores').query({ q: 'tex' }).expect(200)
    const names = res.body.results.map((r: any) => r.name)
    expect(names).toContain('Texas')
    expect(names).not.toContain('Utah')
  })
})



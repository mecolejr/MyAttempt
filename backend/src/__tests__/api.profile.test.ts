import request from 'supertest'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockPrisma: any = {
  user: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
  profile: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
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

describe('profile endpoints', () => {
  const token = 'dev:' + Buffer.from('dev@example.com', 'utf8').toString('base64')

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns null when no profile', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 })
    mockPrisma.profile.findUnique.mockResolvedValue(null)
    const res = await request(app).get('/api/profile').set('x-auth-token', token).expect(200)
    expect(res.body).toEqual({ data: null })
  })

  it('upserts and returns profile data', async () => {
    mockPrisma.user.upsert.mockResolvedValue({ id: 1 })
    mockPrisma.profile.upsert.mockResolvedValue({ id: 1, userId: 1, data: { valuesDiversity: true } })
    const res = await request(app).post('/api/profile').set('x-auth-token', token).send({ data: { valuesDiversity: true } }).expect(200)
    expect(res.body.data.valuesDiversity).toBe(true)
  })
})



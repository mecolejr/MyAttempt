import request from 'supertest'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockPrisma: any = {
  user: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
  favorite: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
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

describe('dev auth and favorites', () => {
  const token = 'dev:' + Buffer.from('dev@example.com', 'utf8').toString('base64')

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('issues a dev token on login', async () => {
    mockPrisma.user.upsert.mockResolvedValue({ id: 1, email: 'dev@example.com' })
    const res = await request(app).post('/api/auth/dev-login').send({ email: 'dev@example.com' }).expect(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token).toContain('dev:')
  })

  it('reads and modifies favorites', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 })
    mockPrisma.favorite.findMany.mockResolvedValue([{ locationId: 42 }])
    const r1 = await request(app).get('/api/favorites').set('x-auth-token', token).expect(200)
    expect(r1.body.favorites).toEqual([42])

    mockPrisma.user.upsert.mockResolvedValue({ id: 1 })
    mockPrisma.favorite.upsert.mockResolvedValue({ id: 99, userId: 1, locationId: 7 })
    await request(app).post('/api/favorites').set('x-auth-token', token).send({ locationId: 7 }).expect(200)

    mockPrisma.favorite.deleteMany.mockResolvedValue({ count: 1 })
    await request(app).delete('/api/favorites/7').set('x-auth-token', token).expect(200)
  })
})



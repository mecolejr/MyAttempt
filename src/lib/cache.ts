// Simple in-memory cache for demo purposes
// In production, this would use Convex or Redis

export class DataCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private ttl: number;

  constructor(ttlHours: number = 12) {
    this.ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.cache.get(key);

      if (!cached) {
        return null;
      }

      // Check if expired
      if (cached.expiresAt < Date.now()) {
        this.cache.delete(key);
        return null;
      }

      return cached.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    try {
      const expiresAt = Date.now() + this.ttl;
      
      this.cache.set(key, {
        data,
        expiresAt
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  generateKey(city: string, state: string, type: string): string {
    return `gov-data:${city}:${state}:${type}`.toLowerCase();
  }
}

export default new DataCache();
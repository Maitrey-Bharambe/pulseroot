import { createClient } from 'redis';

let redisClient = null;
const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.connect().catch((err) => {
      console.warn('[RateLimiter] Failed to connect to Redis. Falling back to memory.', err.message);
      redisClient = null;
    });
  } catch (err) {
    console.warn('[RateLimiter] Redis initialization failed. Falling back to memory.', err.message);
  }
}

// Memory fallback store
const memoryStore = new Map();

// Periodic cleanup of expired memory keys (runs every 60 seconds)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (now > value.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

/**
 * Perform rate limiting checks
 * @param {string} key Unique key to identify the actor (e.g. `auth:ip:127.0.0.1` or `quota:device:ESP001`)
 * @param {number} limit Max requests allowed in window
 * @param {number} windowSeconds Time window in seconds
 * @returns {Promise<{success: boolean, current: number, reset: number}>}
 */
export async function rateLimit(key, limit = 60, windowSeconds = 60) {
  const now = Date.now();

  // Try Redis first
  if (redisClient && redisClient.isOpen) {
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }
      const ttl = await redisClient.ttl(key);
      const reset = Math.ceil(now / 1000) + (ttl > 0 ? ttl : windowSeconds);
      return {
        success: current <= limit,
        current,
        reset
      };
    } catch (err) {
      console.warn('[RateLimiter] Redis command failed, falling back to memory store.', err.message);
    }
  }

  // Memory fallback logic
  const record = memoryStore.get(key);
  if (!record || now > record.resetTime) {
    const resetTime = now + (windowSeconds * 1000);
    memoryStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      current: 1,
      reset: Math.ceil(resetTime / 1000)
    };
  }

  record.count += 1;
  return {
    success: record.count <= limit,
    current: record.count,
    reset: Math.ceil(record.resetTime / 1000)
  };
}

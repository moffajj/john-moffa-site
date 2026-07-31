import 'server-only'
import { Redis } from '@upstash/redis'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function getRequestIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken })
    const count = await redis.incr(key)
    if (count === 1) await redis.pexpire(key, windowMs)
    const ttl = await redis.pttl(key)
    return {
      allowed: count <= limit,
      retryAfter: count <= limit ? 0 : Math.max(1, Math.ceil(ttl / 1000)),
    }
  }

  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return { allowed: true, retryAfter: 0 }
}

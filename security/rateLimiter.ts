interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface BucketState {
  hits: number[];
  blockedUntil?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export class InMemoryRateLimiter {
  private state = new Map<string, BucketState>();
  private readonly options: RateLimiterOptions;

  constructor(options: RateLimiterOptions) {
    this.options = options;
  }

  consume(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.state.get(key) ?? { hits: [] };

    if (bucket.blockedUntil && bucket.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.blockedUntil - now,
      };
    }

    bucket.hits = bucket.hits.filter((time) => now - time < this.options.windowMs);

    if (bucket.hits.length >= this.options.limit) {
      const blockDuration = this.options.blockDurationMs ?? this.options.windowMs;
      bucket.blockedUntil = now + blockDuration;
      this.state.set(key, bucket);
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: blockDuration,
      };
    }

    bucket.hits.push(now);
    bucket.blockedUntil = undefined;
    this.state.set(key, bucket);
    return {
      allowed: true,
      remaining: Math.max(this.options.limit - bucket.hits.length, 0),
      retryAfterMs: 0,
    };
  }
}

export const authRateLimiter = new InMemoryRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
});

export const actionRateLimiter = new InMemoryRateLimiter({
  limit: 40,
  windowMs: 60 * 1000,
  blockDurationMs: 60 * 1000,
});

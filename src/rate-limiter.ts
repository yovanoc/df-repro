import {
  RateLimiterRedis,
  type RateLimiterRes,
  type IRateLimiterRedisOptions,
} from "rate-limiter-flexible";
import { Redis } from "ioredis";

const redisClient = new Redis({
  enableOfflineQueue: false,
});

// It is recommended to process Redis errors and setup some reconnection strategy
redisClient.on("error", (err) => {
  console.error(err);
});

const opts: IRateLimiterRedisOptions = {
  // Basic options
  storeClient: redisClient,
  points: 5, // Number of points
  duration: 5, // Per second(s)

  // Custom
  blockDuration: 0, // Do not block if consumed more than points
  keyPrefix: "rlflx", // must be unique for limiters with different purpose
};

const rateLimiter = new RateLimiterRedis(opts);

const convert = (rateLimiterRes: RateLimiterRes): RateLimit => ({
  "Retry-After": (rateLimiterRes.msBeforeNext / 1000).toString(),
  "X-RateLimit-Limit": opts.points?.toString(),
  "X-RateLimit-Remaining": rateLimiterRes.remainingPoints.toString(),
  "X-RateLimit-Reset": new Date(
    Date.now() + rateLimiterRes.msBeforeNext
  ).toISOString(),
});

export const rateLimit = async (
  ip: string,
  consume = 1
): Promise<RateLimit | null> => {
  try {
    const res = await rateLimiter.consume(ip, consume);
    console.log(res);
    return convert(res);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export type RateLimit = {
  "Retry-After": string;
  "X-RateLimit-Limit": string | undefined;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
};

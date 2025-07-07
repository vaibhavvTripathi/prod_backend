import Redis from "ioredis";

let redis: Redis | undefined = undefined;

export const getRedis = () => {
  if (!redis) {
    if (!process.env.LOCAL_REDIS_URI) {
      throw new Error("LOCAL_REDIS_URI environment variable is not set");
    }
    redis = new Redis(process.env.LOCAL_REDIS_URI);
  }
  return redis;
}; 
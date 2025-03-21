import { createClient } from "redis";

console.log(process.env.REDIS_URL);

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on("error", (err) => {
  console.error("Redis error", err);
});

(async () => {
  await redisClient.connect();
  console.log("Redis connected successfully");
})();

export default redisClient;

import { setTimeout } from "timers/promises";
import { rateLimit } from "./rate-limiter.js";

console.log("Start");
await setTimeout(1000);
const headers = await rateLimit("IP-ADDRESS", 1);
console.log(headers);

console.log("Done");
process.exit(0);

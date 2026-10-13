import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.interval("Shield Family email retries", { minutes: 2 }, internal.shieldOffers.retryEmailJobs);
export default crons;

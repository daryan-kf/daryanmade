import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.interval("Shield Family email retries", { minutes: 2 }, internal.shieldOffers.retryEmailJobs);
crons.interval("Independent app update email retries", { minutes: 2 }, internal.appUpdates.retryAndCleanup);
export default crons;

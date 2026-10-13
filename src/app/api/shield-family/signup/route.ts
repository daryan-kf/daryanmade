import { shieldRequest } from "@/lib/shield-api";
export const runtime = "nodejs";
export async function POST(request: Request) { return shieldRequest(request, "signup"); }

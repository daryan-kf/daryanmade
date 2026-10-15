import { appUpdatesRequest } from "@/lib/app-updates-api";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ app: string; action: string }> }) {
  const { app, action } = await params;
  return appUpdatesRequest(request, app, action);
}

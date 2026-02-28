import type { ScanRequest, ScanResponse } from "./types";

export async function scan(req: ScanRequest): Promise<ScanResponse> {
  const r = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!r.ok) throw new Error(`Scan failed: ${r.status}`);
  return r.json();
}

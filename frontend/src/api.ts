import type { ScanRequest, ScanResponse } from "./types";

export async function scan(req: ScanRequest): Promise<ScanResponse> {
  const r = await fetch("http://localhost:8080/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!r.ok) throw new Error(`Scan failed: ${r.status}`);
  return r.json();
}


export async function sendMessage(req: string) {
  const response = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage: "Testing message" })
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json()
}

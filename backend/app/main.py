from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .models import ScanRequest, ScanResponse, Candidate, Headline, TradePlan
from .scan import scan_universe
from .brightdata import get_headlines_for_ticker

app = FastAPI(title="SignalStack", version="0.1.0")

# For local dev; in production you can lock this down
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/scan", response_model=ScanResponse)
async def scan(req: ScanRequest):
    base = scan_universe(req.universe, req.risk_dollars, top_n=req.top_n)

    candidates = []
    for row in base["top"]:
        headlines = []
        if req.include_headlines:
            hl = await get_headlines_for_ticker(row["ticker"], limit=3)
            headlines = [Headline(**h) for h in hl]

        candidates.append(Candidate(
            ticker=row["ticker"],
            score=row["score"],
            score_breakdown=row["breakdown"],
            indicators=row["indicators"],
            plan=TradePlan(**row["plan"]),
            headlines=headlines,
            reasoning=None
        ))

    return ScanResponse(
        run_id=base["run_id"],
        candidates=candidates,
        meta={
            "universe": req.universe,
            "universe_size": base["universe_size"],
            "scanned": base["scanned"],
            "include_headlines": req.include_headlines,
        }
    )

# ---- Serve frontend (built Vite) from /frontend/dist via Docker build ----
FRONTEND_DIST = os.getenv("FRONTEND_DIST", "/app/frontend/dist")

if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Serve index.html for SPA routes
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index_path)

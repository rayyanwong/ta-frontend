from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any

Universe = Literal["nasdaq100"]

class ScanRequest(BaseModel):
    universe: Universe = "nasdaq100"
    risk_dollars: float = Field(default=50, gt=0)
    include_headlines: bool = True
    include_reasoning: bool = True
    top_n: int = Field(default=3, ge=1, le=10)

class Headline(BaseModel):
    title: str
    url: str

class TradePlan(BaseModel):
    entry_low: float
    entry_high: float
    stop: float
    target: float
    shares: int
    risk_per_share: float
    reward_per_share: float
    rr: float

class Candidate(BaseModel):
    ticker: str
    score: float
    score_breakdown: Dict[str, float]
    indicators: Dict[str, float]
    plan: TradePlan
    headlines: List[Headline] = []
    reasoning: Optional[str] = None
    reason_bullets: List[str] = []
    risk_note: Optional[str] = None

class ScanResponse(BaseModel):
    run_id: str
    candidates: List[Candidate]
    meta: Dict[str, Any] = {}

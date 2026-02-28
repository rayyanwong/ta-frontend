from pydantic import BaseModel


class ChatRequest(BaseModel):
    userMessage: str


class TradeSignal(BaseModel):
    ticker: str
    entry_price: float
    stop_loss: float
    take_profit: float
    position_size: int
    rationale: str

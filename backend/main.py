from fastapi import FastAPI, HTTPException
from models import TradeSignal, ChatRequest
from agent_utils import TradeAgent
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Trade Analysis Agent Service")
agent = TradeAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "online", "message": "Trading Agent is ready for signals."}


@app.post("/upload-trade")
async def upload_new_trade(signal: TradeSignal):
    """
    This endpoint receives the trade JSON from the teammate,
    converts it to a dict, and processes it through Acontext.
    """
    try:
        # We pass the validated Pydantic object directly to your method
        # Inside 'analyze_and_remember', we will use signal.model_dump()
        result = await agent.upload_and_remember(signal)

        print("Result from upload trade: ", result)
        return {
            "success": True,
            "ticker": signal.ticker,
            "analysis": result["response"],
            "session_id": result["session_id"],
        }

    except Exception as e:
        # If Acontext is down or the key is wrong, return a clear error
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # This calls the method we just created
    print()
    print("user sent message: ", request.userMessage)
    print()

    try:
        response_text = await agent.chat_with_mentor(request.userMessage)
        return {"success": True, "mentorReply": response_text}
    except Exception:
        return {"success": False, "mentorReply": ""}


# To run this locally: uvicorn main:app --reload

import os
from acontext import AcontextClient
from dotenv import load_dotenv
from models import TradeSignal
from llm_utils import get_mentor_response
import yfinance as yf
import pandas as pd

load_dotenv()

SESSION_ID = "76a50483-7130-401d-8481-105a498b2db3"


class TradeAgent:
    def __init__(self):
        # STEP 1: Initialize the Client
        self.client = AcontextClient(api_key=os.getenv("ACONTEXT_API_KEY"))
        self.sessionId = SESSION_ID

    async def get_or_create_session(self):
        # If the frontend sent us an ID, use it
        if self.sessionId:
            return self.sessionId

        # If we don't have an ID at all, create ONE and save it
        if not self.sessionId:
            session = self.client.sessions.create()
            self.sessionId = session.id
            print(f"Created NEW Session: {self.sessionId}")

        return self.sessionId

    async def clientStoreMessage(self, sessionId: str, message: str, meta=None):
        self.client.sessions.store_message(
            session_id=sessionId,
            blob={"role": "user", "content": f"{message}"},
            meta=meta,
        )

    async def getSessionMessages(self, sessionId: str):
        return self.client.sessions.get_messages(sessionId).items

    async def upload_and_remember(self, trade_data: TradeSignal):
        # STEP 3: Store & Chat
        ticker = trade_data.ticker
        trade_info = trade_data.model_dump(mode="json")
        session = await self.get_or_create_session()

        # Store the teammate's data as a message in memory
        metaData = {
            "ticker": ticker,
            "source": "scraper_service",
            "type": "trade_analysis",
        }
        await self.clientStoreMessage(
            sessionId=session,
            message=f"I just made a new trade, here is the information: {trade_info}",
            meta=metaData,
        )

        sessionMessages = await self.getSessionMessages(session)
        print("Session Messages: ", sessionMessages)

        response = await get_mentor_response(sessionMessages)

        # This tells Acontext to process the session and extract "skills" or "learnings"
        self.client.sessions.flush(session_id=session)

        return {"analysis": "Works", "session_id": session, "response": response}

    async def chat_with_mentor(self, user_message: str):
        # 1. Get the session (reusing your life-long ID)
        session_id = await self.get_or_create_session()

        # 2. Store the user's question in Acontext so it's remembered forever
        await self.clientStoreMessage(sessionId=session_id, message=user_message)

        # 3. Retrieve the full history (including the question we just added)
        history = await self.getSessionMessages(session_id)

        # 4. Clean history for OpenAI (standardizing content to strings)
        clean_messages = []
        for m in history:
            content = m.get("content", "")
            if not isinstance(content, str):
                content = str(content)
            clean_messages.append({"role": m.get("role", "user"), "content": content})

        # 5. Get the response from your LLM service
        ai_response = await get_mentor_response(clean_messages)

        # 6. Store the AI's response in Acontext so the AI remembers its own advice
        self.client.sessions.store_message(
            session_id=session_id, blob={"role": "assistant", "content": ai_response}
        )

        return ai_response

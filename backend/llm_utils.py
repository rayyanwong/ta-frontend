import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = "You are a professional Trading Mentor. Use the user's logged trade history to provide critical, growth-oriented advice. Make it concise, clear and clean. Only use the context that I have provided to you."


async def sendMessage(messages: list):
    response = await client.chat.completions.create(
        model="gpt-4o-mini", messages=messages
    )
    return response


async def get_mentor_response(messages: list):
    """
    Sends the full history to OpenAI and returns the mentor's advice.
    """
    system_prompt = {"role": "system", "content": SYSTEM_PROMPT}

    # Combine system prompt with the history from Acontext

    fullResponse = [system_prompt] + messages
    print()
    print("Full Response: ", fullResponse)
    print()
    response = await sendMessage(fullResponse)
    print()
    print("AI response: ", response)
    print()
    return response.choices[0].message.content

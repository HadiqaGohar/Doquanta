import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()

async def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    base_url = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
    
    print(f"Testing Gemini API with gpt-3.5-turbo alias...")
    print(f"API Key present: {'Yes' if api_key else 'No'}")
    print(f"Base URL: {base_url}")
    
    if not api_key:
        print("Error: GEMINI_API_KEY is missing.")
        return

    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=60.0
    )

    try:
        print("Sending request to Gemini using gpt-3.5-turbo alias...")
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, are you working?"}],
        )
        print("Success! Response:")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"\n❌ API Call Failed!")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_gemini())

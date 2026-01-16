import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def test_gemini():
    api_key = "AIzaSyAKX1YoaOquopCq5r6myT6uWKPasqfPK2E"
    # Testing different base URLs
    base_urls = [
        "https://generativelanguage.googleapis.com/v1beta/openai/",
        "https://generativelanguage.googleapis.com/v1beta/",
    ]
    
    models = ["gemini-1.5-flash", "models/gemini-1.5-flash"]
    
    for url in base_urls:
        for model in models:
            print(f"\nTesting URL: {url} | Model: {model}")
            client = AsyncOpenAI(api_key=api_key, base_url=url)
            try:
                response = await client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Say hello"}],
                    max_tokens=10
                )
                print(f"SUCCESS! Response: {response.choices[0].message.content}")
                return url, model
            except Exception as e:
                print(f"FAILED: {str(e)}")
    return None, None

if __name__ == "__main__":
    asyncio.run(test_gemini())


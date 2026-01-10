import os
import google.generativeai as genai

# Paste your NEW API key here
os.environ["GOOGLE_API_KEY"] = "AIzaSyBXX8jdChLX7zaOfPW4UmcEk8HCcCoodEo"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

print("🔍 Searching for available models...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        # We only want Flash or Pro models
        if "flash" in m.name or "pro" in m.name:
            print(f"✅ Found: {m.name}")
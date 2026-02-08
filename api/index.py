import asyncio
import os
import io
import base64
import httpx
import PIL.Image
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Vercel doesn't need load_dotenv if you set variables in the dashboard, 
# but this keeps it working locally.
load_dotenv()

app = FastAPI()

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# REST API uses the model string in the URL
MODEL_NAME = 'gemini-3-flash-preview'

SUPPORTED_LANGUAGES = {
    "en": "English", "ur": "Urdu", "hi": "Hindi", 
    "ar": "Arabic", "fr": "French", "es": "Spanish"
}

FEATURE_PROMPTS = {
    "nav": "Navigation Assistant: Describe the 3 most important objects in front of the user and their positions (left, right, or center). Help a blind person navigate safely.",
    "read": "Reading Assistant: Extract all text from this image. If it's a menu, sign, or document, provide a clear and concise summary.",
    "money": "Currency Detector: Identify any banknotes or coins in this image and state their total value clearly.",
    "hazard": "Safety Scout: Scan for immediate dangers like stairs, wet floors, open manholes, or sharp obstacles. Alert the user only to these hazards.",
    "scene": "Scene Describer: Provide a vivid but brief description of the overall environment (e.g., 'You are in a park' or 'You are in a hospital hallway')."
}

@app.get("/health")
async def health():
    return {"status": "alive"}

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...), 
    lang: str = Form("en"), 
    mode: str = Form("nav")
):
    print(f"\n[1] Request Received! Mode: {mode}, Lang: {lang}")
    
    try:
        # Step 1: Read and Encode Image to Base64
        content = await file.read()
        
        # We use PIL just to ensure it's a valid image and get the right format
        img = PIL.Image.open(io.BytesIO(content))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=70) # Compress slightly to save tokens
        encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Step 2: Build the Dynamic Prompt
        target_lang = SUPPORTED_LANGUAGES.get(lang, "English")
        base_prompt = FEATURE_PROMPTS.get(mode, FEATURE_PROMPTS["nav"])
        
        full_prompt = (
            f"{base_prompt}\n\n"
            f"IMPORTANT INSTRUCTIONS:\n"
            f"1. Respond ONLY in {target_lang} script.\n"
            f"2. Keep the response under 40 words so it is easy to hear via Text-to-Speech.\n"
            f"3. Be direct and helpful for a visually impaired user."
        )

        # Step 3: Call Gemini REST API via httpx
        # No heavy SDK required!
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": full_prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_image
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 200,
            }
        }

        async with httpx.AsyncClient() as client:
            # Retry logic included
            for attempt in range(3):
                response = await client.post(url, json=payload, timeout=30.0)
                
                if response.status_code == 200:
                    result = response.json()
                    try:
                        # Extract text from standard Gemini JSON response
                        analysis = result['candidates'][0]['content']['parts'][0]['text']
                        return {
                            "analysis": analysis.strip(),
                            "mode": mode,
                            "language": target_lang
                        }
                    except (KeyError, IndexError):
                        return {"error": "AI provided an empty or invalid response."}
                
                elif response.status_code == 429:
                    print(f"!!! Rate limit hit. Retrying in 10s... (Attempt {attempt+1})")
                    await asyncio.sleep(10)
                else:
                    print(f"!!! API Error {response.status_code}: {response.text}")
                    return {"error": f"API Error: {response.status_code}"}

        return {"error": "Server is busy. Please try again later."}

    except Exception as e:
        print(f"!!! SYSTEM ERROR: {str(e)}")
        return {"error": "Internal server error."}

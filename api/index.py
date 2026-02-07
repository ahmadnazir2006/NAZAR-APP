from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from google.api_core import exceptions
import PIL.Image
import io
import uvicorn
import time

app = FastAPI()

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GEMINI SETUP ---
GENAI_API_KEY = "YOUR_ACTUAL_API_KEY" 
genai.configure(api_key=GENAI_API_KEY)

# Keeping your requested model
MODEL_NAME = 'gemini-3-flash-preview'

try:
    model = genai.GenerativeModel(MODEL_NAME)
    print(f"--- {MODEL_NAME} Loaded Successfully ---")
except Exception as e:
    print(f"--- Error Loading Model: {e} ---")

# --- CONFIGURATION: LANGUAGES & FEATURES ---
SUPPORTED_LANGUAGES = {
    "en": "English",
    "ur": "Urdu",
    "hi": "Hindi",
    "ar": "Arabic",
    "fr": "French",
    "es": "Spanish"
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
async def analyze_image(
    file: UploadFile = File(...), 
    lang: str = Form("en"), 
    mode: str = Form("nav")
):
    print(f"\n[1] Request Received! Mode: {mode}, Lang: {lang}")
    
    try:
        # Step 1: Read and process the Image
        content = await file.read()
        img = PIL.Image.open(io.BytesIO(content))
        
        # Step 2: Build the Dynamic Prompt
        target_lang = SUPPORTED_LANGUAGES.get(lang, "English")
        base_prompt = FEATURE_PROMPTS.get(mode, FEATURE_PROMPTS["nav"])
        
        # Advanced system instruction for accessibility
        full_prompt = (
            f"{base_prompt}\n\n"
            f"IMPORTANT INSTRUCTIONS:\n"
            f"1. Respond ONLY in {target_lang} script.\n"
            f"2. Keep the response under 40 words so it is easy to hear via Text-to-Speech.\n"
            f"3. Be direct and helpful for a visually impaired user."
        )

        print(f"[3] Calling {MODEL_NAME} for {mode} in {target_lang}...")
        
        # Step 3: Call Gemini with Retry Logic
        response_text = ""
        for attempt in range(3):
            try:
                # Using Gemini 3's multimodal capabilities
                response = model.generate_content([full_prompt, img])
                response_text = response.text.strip()
                break 
            except exceptions.ResourceExhausted:
                wait_time = 15
                print(f"!!! Rate limit hit. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            except Exception as e:
                print(f"!!! API Error: {str(e)}")
                return {"error": "API error. Please try again."}

        if not response_text:
            return {"error": "API did not respond. Check your quota."}

        print(f"[4] Success!")
        return {
            "analysis": response_text,
            "mode": mode,
            "language": target_lang
        }

    except Exception as e:
        print(f"!!! SYSTEM ERROR: {str(e)}")
        return {"error": "Internal server error."}

if __name__ == "__main__":
    print("--- Starting Nazar Backend on http://127.0.0.1:8000 ---")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
import os
import mimetypes
import base64
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import openai

# Load environment variables
load_dotenv()
print("🔑 OpenAI API Key Loaded:", os.getenv("OPENAI_API_KEY")[:8], "****")
app = Flask(__name__)
CORS(app)

# Configure API keys
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

# Utility: Load image as bytes
def load_image_bytes(image_file):
    try:
        image_bytes = image_file.read()
        mime_type, _ = mimetypes.guess_type(image_file.filename)
        return {"mime_type": mime_type, "data": image_bytes}
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return None

# DALL·E 3 Image Generator with proper error handling
def generate_architectural_image(prompt):
    try:
        print("📸 Generating image with DALL·E 3...")
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        print("✅ Image URL:", image_url)

        image_response = requests.get(image_url)
        if image_response.status_code == 200:
            print("✅ Image fetched successfully.")
            return {
                "image_base64": base64.b64encode(image_response.content).decode("utf-8"),
                "mime": image_response.headers.get("Content-Type", "image/png").split("/")[-1]
            }
        else:
            print("❌ Failed to fetch image content from URL")
            return {"error": "Image download failed"}
    except openai.error.OpenAIError as e:
        print("❌ OpenAI API Error:", str(e))
        return {"error": str(e)}
    except Exception as e:
        print("❌ Unexpected Error:", str(e))
        return {"error": str(e)}

# Main route handler
@app.route("/analyze", methods=["POST"])
def analyze_architecture():
    prompt = request.form.get("prompt", "").strip()
    image_file = request.files.get("image")
    mode = request.form.get("mode", "").strip().lower()

    if not prompt:
        return jsonify({"error": "Prompt is required."}), 400

    # 🔒 Filter non-architectural prompts
    banned_keywords = ["amazon", "sale", "discount", "marketing", "car", "fashion", "celebrity"]
    if any(word in prompt.lower() for word in banned_keywords):
        return jsonify({
            "output": "❌ Sorry, I can only help with architectural design prompts like buildings, homes, interiors, materials, or layout ideas.",
            "image": None
        })

    try:
        response_text = ""
        generated_image = None

        # 📄 Gemini Text Mode
        if mode == "text":
            model = genai.GenerativeModel("gemini-2.0-flash")
            parts = []

            if image_file:
                image_data = load_image_bytes(image_file)
                if image_data:
                    parts.append({
                        "mime_type": image_data["mime_type"],
                        "data": image_data["data"]
                    })

            prompt_text = f"""
You are a friendly, intelligent AI architecture consultant. Based on the prompt, reply conversationally and include:

1. Greeting + appreciation  
2. Layout ideas  
3. Material suggestions with costs  
4. Sustainability or smart tech suggestions  
5. Trend insight  
6. Follow-up question  

**Then add a table using VALID MARKDOWN TABLE format, like this:**

| Element                 | Estimated Cost / Trend            |
|-------------------------|-----------------------------------|
| Concrete Blocks/Bricks | $1–$3 per block                   |
| Engineered Wood Flooring | $3–$8 per sq ft                  |
| Solar Panels            | Varies by wattage (~$2.80/watt)  |

**Do NOT use extra pipes or mix multiple columns into one cell.**

Prompt: "{prompt}"
"""
            parts.append({"text": prompt_text})
            result = model.generate_content(parts)
            response_text = result.text

        # 🎨 DALL·E Image Mode
        elif mode == "image":
            result = generate_architectural_image(prompt)

            if result and "error" in result:
                return jsonify({"error": result["error"]}), 500

            generated_image = result

        else:
            return jsonify({"error": "Invalid mode specified. Use 'text' or 'image'."}), 400

        return jsonify({
            "output": response_text,
            "image": generated_image
        })

    except Exception as e:
        print("❌ Server Exception:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ✅ Run Server
if __name__ == "__main__":
    print("🚀 Flask backend running at http://localhost:3001")
    app.run(debug=True, port=3001)

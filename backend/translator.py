#!/usr/bin/env python3
# backend/translator.py - Final Optimized Version 2.0
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import os, sys, json, logging

# Configure logging to show up in PM2 logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("translator")

app = Flask(__name__)

def translate_logic(text, target_lang, source_lang='auto'):
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {"error": "Empty text provided", "success": False}
    if len(text) > 5000:
        return {"error": "Text too long (max 5000 characters)", "success": False}
    
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)
        return {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "original_text": text,
            "success": True
        }
    except Exception as e:
        logger.error(f"Translation logic error: {str(e)}")
        return {"error": str(e), "success": False}

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload"}), 400
            
        result = translate_logic(
            data.get('text'), 
            data.get('target_lang'), 
            data.get('source_lang', 'auto')
        )
        return jsonify(result), 200 if result["success"] else 400
    except Exception as e:
        logger.error(f"Internal error in /translate: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/translate/batch', methods=['POST'])
def translate_batch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload"}), 400

        target_lang = data.get('target_lang')
        texts = data.get('translations') # Matches frontend property name
        
        if not target_lang or not texts or not isinstance(texts, list):
            return jsonify({"error": "Missing target_lang or translations array"}), 400

        results = []
        for text in texts:
            res = translate_logic(text, target_lang)
            results.append({
                "success": res["success"],
                "translation": res.get("translation", ""),
                "original": text,
                "error": res.get("error")
            })

        return jsonify({"results": results, "success": True})
    except Exception as e:
        logger.error(f"Internal error in /translate/batch: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "version": "2.0-batch-ready",
        "service": "translator"
    })

@app.errorhandler(404)
def handle_404(e):
    logger.warning(f"404 Not Found: {request.path} [{request.method}]")
    return jsonify({
        "error": "Route not found in translator.py", 
        "path": request.path,
        "method": request.method
    }), 404

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5005))
    logger.info(f"Starting Translator (V2.0) on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
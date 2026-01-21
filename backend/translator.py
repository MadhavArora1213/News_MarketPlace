#!/usr/bin/env python3
# translator.py - Flask microservice for translation using deep-translator
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import os

app = Flask(__name__)

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang')
        text = data.get('text')

        if not target_lang or not text:
            return jsonify({"error": "Missing required parameters: target_lang and text"}), 400

        if not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({"error": "Text must be a non-empty string"}), 400

        if len(text) > 5000:
            return jsonify({"error": "Text too long (max 5000 characters)"}), 400

        # Use GoogleTranslator via deep-translator
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)

        # Return successful result
        result = {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "original_text": text
        }
        return jsonify(result)

    except Exception as e:
        # Return error result
        error_result = {
            "error": str(e),
            "source_lang": source_lang if 'source_lang' in locals() else None,
            "target_lang": target_lang if 'target_lang' in locals() else None,
            "original_text": text if 'text' in locals() else None
        }
        return jsonify(error_result), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=False)
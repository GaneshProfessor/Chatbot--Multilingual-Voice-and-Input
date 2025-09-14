from flask import Flask, request, jsonify, render_template
import logging
import os
import ssl
import httpx
from dotenv import load_dotenv
from openai import OpenAI
import pyttsx3
import speech_recognition as sr

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

# Initialize OpenAI client with your API key
Model = "gpt-3.5-turbo"
load_dotenv()  # reads the .env file
api_key = os.getenv('OPENAI_API_KEY')

# Check if API key exists
if not api_key:
    logging.error("OPENAI_API_KEY not found in environment variables")
    client = None
else:
    try:
        # Create HTTP client with SSL verification disabled
        http_client = httpx.Client(verify=False)
        
        client = OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        logging.info("OpenAI client initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize OpenAI client: {e}")
        client = None

# Map short codes to full language names
lang_map = {'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil'}

def get_response(question, lang='en'):
    if not client:
        return "Error: OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
    
    try:
        language = lang_map.get(lang, 'English')
        completion = client.chat.completions.create(
            model=Model,
            messages=[
                {'role': 'system', 'content': f"You are a helpful assistant. Reply in {language}."},
                {'role': 'user', 'content': question}
            ],
            max_tokens=200
        )
        return completion.choices[0].message.content
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        return f"Sorry, I encountered an error: {str(e)}"

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        logging.exception("Exception in home route")
        return jsonify({'error': 'An internal error has occurred.'}), 500

@app.route('/query', methods=['POST'])
def query():
    try:
        user_input = request.form.get('text', '')
        lang = request.form.get('lang', 'en')
        
        if not user_input.strip():
            return jsonify({'error': 'Please enter a message'}), 400
            
        print(f"Received input: {user_input}, language: {lang}")
        response = get_response(user_input, lang)
        return jsonify(response)
        
    except Exception as e:
        logging.exception("Exception in query route")
        return jsonify({'error': 'An internal error has occurred.'}), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Enable debug mode for better error messages

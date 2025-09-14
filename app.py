from flask import Flask, request, jsonify, render_template
import logging
import os
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
client = OpenAI(api_key=api_key)

# Map short codes to full language names
lang_map = {'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil'}

def get_response(question, lang='en'):
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

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        logging.exception("Exception in home route")
        return jsonify({'error': 'An internal error has occurred.'}), 500
        print(f"Exception in home(): {e}")
@app.route('/query', methods=['POST'])
def query():
    user_input = request.form.get('text', '')
    lang = request.form.get('lang', 'en')
    print(f"Received input: {user_input}, language: {lang}")  # <-- debug
    response = get_response(user_input, lang)
    return jsonify(response)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=False)


def get_response(question):
    completion = client.chat.completions.create(
        model=Model,
        messages=[
            {'role': 'system', 'content': "You are a helpful assistant."},
            {'role': 'user', 'content': question}
        ],
        max_tokens=200
    )
    answer = completion.choices[0].message.content
    return answer

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        logging.exception("Exception in home route")
        return jsonify({'error': 'An internal error has occurred.'}), 500

@app.route('/query', methods=['POST'])
def query():
    user_input = request.form['text']
    response = get_response(user_input)
    return jsonify(response)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=False)

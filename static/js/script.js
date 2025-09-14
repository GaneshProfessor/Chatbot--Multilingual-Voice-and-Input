var synthesis = window.speechSynthesis;
var recognition;
var isRecognizing = false;

setTimeout(() => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    const main = document.getElementById('mainPage');
    if (main) {
        main.style.display = 'block';
        setTimeout(() => { main.style.opacity = 1; }, 50);
    }
}, 3000);

// Map dropdown language codes to TTS language codes
const langMap = { 'en': 'en-US', 'hi': 'hi-IN', 'ta': 'ta-IN' };

function speak(text, lang='en-US') {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;  // set language for TTS
    utterance.onend = function() {
        console.log('Speech synthesis finished speaking.');
    };
    synthesis.speak(utterance);
}

function setupRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US'; // default
        recognition.interimResults = false;

        recognition.onstart = function() { isRecognizing = true; console.log("Voice recognition started."); };
        recognition.onresult = function(event) {
            isRecognizing = false;
            var transcript = event.results[0][0].transcript;
            document.getElementById('userInput').value = transcript;
            submitForm();
        };
        recognition.onerror = function(event) { isRecognizing = false; console.error('Recognition error: ' + event.error); };
        recognition.onend = function() { isRecognizing = false; console.log("Voice recognition ended."); };
    } else {
        console.log("Browser does not support Web Speech API");
    }
}

function startRecognition() {
    const selectedLang = document.getElementById('languageSelect').value;
    if (!recognition) setupRecognition();
    recognition.lang = langMap[selectedLang] || 'en-US'; // Update recognition language
    if (!isRecognizing) recognition.start();
    else console.log("Recognition already started...");
}

function addMessage(type, text) {
    let div = document.createElement('div');
    div.className = `message ${type}-message`;

    let icon = document.createElement('i');
    icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-robot';

    let contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';

    let name = document.createElement('div');
    name.className = 'message-name';
    name.textContent = type === 'user' ? 'You' : 'AI Assistant';

    let content = document.createElement('div');
    content.className = 'message-text';
    content.textContent = text;

    contentWrapper.appendChild(name);
    contentWrapper.appendChild(content);
    div.appendChild(icon);
    div.appendChild(contentWrapper);
    document.getElementById('responses').appendChild(div);

    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function showLoading() {
    let div = document.createElement('div');
    div.className = 'message bot-message loading';
    div.innerHTML = '<i class="fas fa-robot"></i><div class="typing-indicator"><span></span><span></span><span></span></div>';
    document.getElementById('responses').appendChild(div);
    return div;
}

function removeLoading(element) {
    if (element && element.parentNode) element.parentNode.removeChild(element);
}

async function submitForm() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    const loadingIndicator = showLoading();

    try {
        const selectedLang = document.getElementById('languageSelect').value;
        const formData = new FormData();
        formData.append('text', userInput);
        formData.append('lang', selectedLang);

        const response = await fetch('/query', { method: 'POST', body: formData });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        removeLoading(loadingIndicator);

        // Check if response contains an error
        if (data.error) {
            addMessage('error', data.error);
        } else {
            addMessage('bot', data);
            speak(data, langMap[selectedLang]);
        }
    } catch (error) {
        console.error('Error:', error);
        removeLoading(loadingIndicator);
        addMessage('error', 'Sorry, there was an error processing your request. Please check your internet connection and try again.');
    }

    document.getElementById('userInput').value = '';
}

document.getElementById('chatForm').onsubmit = function(e) {
    e.preventDefault();
    if (isRecognizing) recognition.stop();
    submitForm();
};

// Cursor particles code remains unchanged
document.addEventListener('DOMContentLoaded', function() {
    const cursorEffectsContainer = document.createElement('div');
    document.body.appendChild(cursorEffectsContainer);
    const particles = [];
    const numberOfParticles = 10;
    const colors = ['var(--particle-color-1)', 'var(--particle-color-2)', 'var(--particle-color-3)', 'var(--particle-color-4)', 'var(--particle-color-5)'];

    for (let i = 0; i < numberOfParticles; i++) {
        let particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.backgroundColor = colors[i % colors.length];
        cursorEffectsContainer.appendChild(particle);
        particles.push(particle);
    }

    document.addEventListener('mousemove', function(event) {
        let x = event.clientX;
        let y = event.clientY;
        particles.forEach((particle, index) => {
            setTimeout(() => { particle.style.transform = `translate(${x - 4}px, ${y - 4}px)`; }, index * 100);
        });
    });
});

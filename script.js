window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'en-US';

// button controls
const toggleBtn = document.getElementById('toggle-btn');
const statusSpan = document.getElementById('status');

let running = false; // whether user explicitly started recognition

function setStatus(s) {
    statusSpan.textContent = s;
}

function startRecognition() {
    if (running) return;
    running = true;
    toggleBtn.textContent = 'Stop';
    setStatus('Starting...');
    try {
        recognition.start();
    } catch (err) {
        console.error('recognition.start() threw', err);
        running = false;
        toggleBtn.textContent = 'Start';
        setStatus('Error starting');
    }
}

function stopRecognition() {
    if (!running) return;
    running = false;
    toggleBtn.textContent = 'Start';
    setStatus('Stopping...');
    try {
        recognition.stop();
    } catch (err) {
        console.error('recognition.stop() threw', err);
    }
}

toggleBtn.addEventListener('click', () => {
    if (running) stopRecognition(); else startRecognition();
});

let p = document.createElement('p');
const words = document.querySelector('.words');
words.appendChild(p);

recognition.addEventListener('result', e => {
    console.log(e);
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    p.textContent = transcript;

    if (e.results[0].isFinal) {
        p = document.createElement('p');
        words.appendChild(p);
    }

    if (transcript.includes("What is the time")) {
        const time = new Date().toLocaleTimeString();
        const timePara = document.createElement('p');
        timePara.textContent = `The current time is ${time}`;
        words.appendChild(timePara);
        p = document.createElement('p');
        words.appendChild(p);
    }

    if (transcript.includes('stop')) {
        stopRecognition();
    }

    if (transcript.includes('clear')) {
        words.innerHTML = '';
        p = document.createElement('p');
        words.appendChild(p);
    }
});

// Properly handle recognition start
recognition.addEventListener('start', () => {
    setStatus('Listening...');
});

// Automatically restart if still running (user hasn't clicked stop)
recognition.addEventListener('end', () => {
    if (running) {
        console.log('Recognition ended, restarting...');
        setStatus('Restarting...');
        try {
            recognition.start();
        } catch (err) {
            console.error('Failed to restart:', err);
            running = false;
            toggleBtn.textContent = 'Start';
            setStatus('Error - Click Start');
        }
    } else {
        setStatus('Stopped');
    }
});

// Handle errors
recognition.addEventListener('error', (e) => {
    console.error('Recognition error:', e.error);
    if (e.error === 'no-speech' || e.error === 'audio-capture') {
        setStatus(`Error: ${e.error}`);
    }
});
// OPENAI_API_KEY is loaded from config.js
const summarizeBtn = document.getElementById('summarizeBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const simplifyBtn = document.getElementById('simplifyBtn');
const speakBtn = document.getElementById('speakBtn');
const inputText = document.getElementById('inputText');
const output = document.getElementById('output');
const wordExplainerBtn = document.getElementById('explainBtn'); // Fix: match the HTML ID
const definitionBox = document.getElementById('definitionBox');

const accessibilityToggle = document.getElementById('accessibilityToggle');

// Ensure it's focusable via keyboard
accessibilityToggle?.setAttribute('tabindex', '0');
accessibilityToggle?.setAttribute('role', 'button');
accessibilityToggle?.setAttribute('aria-label', 'Toggle Accessibility Mode');
accessibilityToggle?.setAttribute('title', 'Enable accessibility mode');

accessibilityToggle?.addEventListener('click', () => {
  document.body.classList.toggle('accessibility-mode');
  accessibilityToggle.setAttribute(
    'aria-pressed',
    document.body.classList.contains('accessibility-mode').toString()
  );
});

accessibilityToggle?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    document.body.classList.toggle('accessibility-mode');
    accessibilityToggle.setAttribute(
      'aria-pressed',
      document.body.classList.contains('accessibility-mode').toString()
    );
  }
});

simplifyBtn.addEventListener('click', async () => {
  const userText = inputText.value;
  loadingIndicator.textContent = "Simplifying...";
  loadingIndicator.setAttribute('aria-live', 'polite');
  loadingIndicator.setAttribute('role', 'status');
  const simplified = await simplifyText(userText);
  output.classList.remove("active");
  void output.offsetWidth; // trigger reflow
  output.textContent = simplified;
  output.classList.add("active");
  loadingIndicator.textContent = "";
});

speakBtn.addEventListener('click', () => {
  const text = output.textContent;
  speak(text);
});

async function simplifyText(text) {
  try {
    const response = await fetch('https://cleartextai-backend.onrender.com/simplify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data.result;
  } catch (err) {
    console.error("Error simplifying:", err);
    return "There was an error simplifying your text.";
  }
}

summarizeBtn.addEventListener('click', async () => {
  const userText = inputText.value;
  loadingIndicator.textContent = "Summarizing...";
  loadingIndicator.setAttribute('aria-live', 'polite');
  loadingIndicator.setAttribute('role', 'status');
  const summary = await summarizeText(userText);
  output.classList.remove("active");
  void output.offsetWidth; // trigger reflow
  output.textContent = summary;
  output.classList.add("active");
  loadingIndicator.textContent = "";
});

async function summarizeText(text) {
  try {
    const response = await fetch('https://cleartextai-backend.onrender.com/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data.result;
  } catch (err) {
    console.error("Error summarizing:", err);
    return "There was an error summarizing your text.";
  }
}

clearBtn.addEventListener('click', () => {
  inputText.value = "";
  output.textContent = "";
  loadingIndicator.textContent = "";
});

wordExplainerBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  console.log("Word Explainer clicked with text:", text);

  output.innerHTML = '';
  wordExplainerBtn.setAttribute('aria-label', 'Word Explainer button – activated');
  wordExplainerBtn.setAttribute('aria-pressed', 'true');
  output.setAttribute('aria-live', 'polite');
  output.setAttribute('role', 'region');
  if (!text) {
    output.textContent = "Please enter a word to explain.";
    return;
  }
  loadingIndicator.textContent = "Explaining...";
  loadingIndicator.setAttribute('aria-live', 'polite');
  loadingIndicator.setAttribute('role', 'status');
  loadingIndicator.classList.add("loading");

  const words = text.split(/\s+/);

  for (const word of words) {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.cursor = 'pointer';
    span.style.textDecoration = 'underline dotted';
    output.appendChild(span);

    try {
      const definition = await fetchDefinition(word);
      const defText = document.createElement('div');
      defText.className = 'definition-output';
      defText.textContent = `${word}: ${definition}`;
      defText.setAttribute('role', 'note');
      defText.setAttribute('aria-live', 'polite');
      output.appendChild(defText);
    } catch (err) {
      const errorText = document.createElement('div');
      errorText.className = 'definition-output';
      errorText.textContent = `Could not fetch definition for "${word}".`;
      errorText.setAttribute('role', 'note');
      errorText.setAttribute('aria-live', 'polite');
      output.appendChild(errorText);
    }
  }

  wordExplainerBtn.setAttribute('aria-pressed', 'false');

  loadingIndicator.textContent = "";
  loadingIndicator.classList.remove("loading");
});

async function fetchDefinition(word) {
  const response = await fetch('https://cleartextai-backend.onrender.com/define', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ word })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data.result || "No definition found.";
}

function speak(text) {
  if (!text.trim()) {
    console.log("No text to speak.");
    return;
  }
  console.log("Speaking:", text);
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

function trapFocus(container) {
  const focusableElements = container.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Device detection and UI adjustment for mobile/tablet
function isMobileOrTablet() {
  return /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', () => {
  if (isMobileOrTablet()) {
    document.body.classList.add('mobile-ui');
  }
});

accessibilityToggle?.addEventListener('click', () => {
  if (document.body.classList.contains('accessibility-mode')) {
    setTimeout(() => trapFocus(document.body), 0);
    // Visually indicate accessibility mode
    document.body.classList.add('accessibility-highlight');
    setTimeout(() => {
      document.body.classList.remove('accessibility-highlight');
    }, 1500);

    // Announce mode change
    const announce = document.createElement('div');
    announce.setAttribute('role', 'status');
    announce.setAttribute('aria-live', 'polite');
    announce.className = 'sr-only';
    announce.textContent = 'Accessibility mode enabled';
    document.body.appendChild(announce);
    setTimeout(() => announce.remove(), 2000);
  }
});
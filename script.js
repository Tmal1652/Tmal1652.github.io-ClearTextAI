// OPENAI_API_KEY is loaded from config.js
const summarizeBtn = document.getElementById('summarizeBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const simplifyBtn = document.getElementById('simplifyBtn');
const speakBtn = document.getElementById('speakBtn');
const inputText = document.getElementById('inputText');
const output = document.getElementById('output');


simplifyBtn.addEventListener('click', async () => {
  const userText = inputText.value;
  loadingIndicator.textContent = "Simplifying...";
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
  const response = await fetch('https://cleartextai-backend.onrender.com/simplify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Simplify this text to a 6th grade level:\n\n${text}` }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

summarizeBtn.addEventListener('click', async () => {
  const userText = inputText.value;
  loadingIndicator.textContent = "Summarizing...";
  const summary = await summarizeText(userText);
  output.classList.remove("active");
  void output.offsetWidth; // trigger reflow
  output.textContent = summary;
  output.classList.add("active");
  loadingIndicator.textContent = "";
});

async function summarizeText(text) {
  const response = await fetch('https://cleartextai-backend.onrender.com/summarize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Summarize this text in 1-2 simple sentences:\n\n${text}` }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

clearBtn.addEventListener('click', () => {
  inputText.value = "";
  output.textContent = "";
  loadingIndicator.textContent = "";
});

function speak(text) {
  if (!text.trim()) {
    console.log("No text to speak.");
    return;
  }
  console.log("Speaking:", text);
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}
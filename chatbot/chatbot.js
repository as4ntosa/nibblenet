// ─────────────────────────────────────────────────────────
// Featherless AI Chatbot
// ─────────────────────────────────────────────────────────

// ⬇️  PASTE YOUR FEATHERLESS API KEY HERE
const FEATHERLESS_API_KEY = "rc_82ef6597804cb6b2ab383a3b60d9d088c29c0a45e06d567d512066fbc7e70dcc";

// ⬇️  FEATHERLESS API ENDPOINT (OpenAI-compatible)
//     Change the model name if you want a different one.
const FEATHERLESS_API_URL = "https://api.featherless.ai/v1/chat/completions";
const FEATHERLESS_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct";

// ── DOM elements ──────────────────────────────────────────
const bubble      = document.getElementById("chat-bubble");
const chatWindow  = document.getElementById("chat-window");
const closeBtn    = document.getElementById("chat-close");
const messagesDiv = document.getElementById("chat-messages");
const chatForm    = document.getElementById("chat-form");
const chatInput   = document.getElementById("chat-input");
const iconChat    = document.getElementById("bubble-icon-chat");
const iconClose   = document.getElementById("bubble-icon-close");
const badge       = document.getElementById("bubble-badge");

// Chat history sent to the API for context
const conversationHistory = [
  {
    role: "system",
    content:
      "You are a friendly and helpful AI assistant for a website. " +
      "Keep answers concise and helpful. " +
      "If the user asks how to contact us, reply with: " +
      '"You can reach us at: support@mysite.com"',
  },
];

let isOpen = false;

// ── Toggle chat window ────────────────────────────────────
function toggleChat() {
  isOpen = !isOpen;
  chatWindow.classList.toggle("hidden", !isOpen);
  iconChat.style.display  = isOpen ? "none"  : "block";
  iconClose.style.display = isOpen ? "block" : "none";
  badge.style.display = "none"; // clear badge on open

  if (isOpen) {
    chatInput.focus();
    scrollToBottom();
  }
}

bubble.addEventListener("click", toggleChat);
closeBtn.addEventListener("click", toggleChat);

// ── Auto-greet after 5 seconds ────────────────────────────
setTimeout(() => {
  if (!isOpen && messagesDiv.children.length === 0) {
    appendMessage("bot", "Hi! Do you need help with anything?");
    conversationHistory.push({
      role: "assistant",
      content: "Hi! Do you need help with anything?",
    });
    // Show unread badge
    badge.style.display = "block";
  }
}, 5000);

// ── Send message on form submit ───────────────────────────
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // Show user message
  appendMessage("user", text);
  chatInput.value = "";

  // Add to conversation history
  conversationHistory.push({ role: "user", content: text });

  // Check for contact-us shortcut (works even if API key is missing)
  if (/contact|reach|email|support/i.test(text)) {
    const reply = "You can reach us at: support@mysite.com";
    appendMessage("bot", reply);
    conversationHistory.push({ role: "assistant", content: reply });
    return;
  }

  // Show typing indicator
  const typing = showTyping();

  try {
    const reply = await fetchAIResponse();
    removeTyping(typing);
    appendMessage("bot", reply);
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    removeTyping(typing);
    appendMessage(
      "bot",
      "Sorry, I wasn't able to get a response. Please try again later."
    );
    console.error("Featherless API error:", err);
  }
});

// ── Call the Featherless AI API ────────────────────────────
async function fetchAIResponse() {
  const response = await fetch(FEATHERLESS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ⬇️  The API key is sent as a Bearer token
      Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
    },
    body: JSON.stringify({
      model: FEATHERLESS_MODEL,
      messages: conversationHistory,
      max_tokens: 256,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ── UI helpers ────────────────────────────────────────────
function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  messagesDiv.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  messagesDiv.appendChild(div);
  scrollToBottom();
  return div;
}

function removeTyping(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

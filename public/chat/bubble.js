// thisway-chat.js
const template = document.createElement("template");
template.innerHTML = `
  <style>
    /* All existing styles remain unchanged */
    :host {
      --chat-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      --chat-primary: #000;
      --chat-bg: #fff;
      --chat-border: #e2e8f0;
      --chat-radius: 8px;
      --chat-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      --chat-text: #1a1a1a;
      --chat-text-light: #64748b;
      --chat-user-bubble: #000;
      --chat-user-text: #fff;
      --chat-bot-bubble: #f1f5f9;
      --chat-bot-text: #1a1a1a;
      
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999;
    }

    .chat-container {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 384px;
      height: 600px;
      background: var(--chat-bg);
      border-radius: 16px;
      box-shadow: var(--chat-shadow);
      display: flex;
      flex-direction: column;
      font-family: var(--chat-font);
      transform-origin: bottom right;
      animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .chat-container.hidden {
      display: none;
    }

    .toggle-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--chat-primary);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--chat-shadow);
      transition: transform 0.2s;
    }

    .toggle-btn:hover {
      transform: scale(1.05);
    }

    .toggle-btn svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--chat-border);
      background: var(--chat-bg);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }

    .status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
      flex: 1;
    }

    .close-btn {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--chat-text-light);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--chat-text);
    }

    .messages {
      flex: 1;
      padding: 24px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 80%;
      animation: fadeIn 0.2s ease-out;
    }

    .message.user {
      align-self: flex-end;
    }

    .message.bot {
      align-self: flex-start;
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .message.user .bubble {
      background: var(--chat-user-bubble);
      color: var(--chat-user-text);
      border-bottom-right-radius: 4px;
    }

    .message.bot .bubble {
      background: var(--chat-bot-bubble);
      color: var(--chat-bot-text);
      border-bottom-left-radius: 4px;
    }

    .chat-input {
      padding: 16px;
      border-top: 1px solid var(--chat-border);
      background: var(--chat-bg);
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
    }

    .input-form {
      display: flex;
      gap: 8px;
    }

    .input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--chat-border);
      border-radius: var(--chat-radius);
      font-size: 14px;
      line-height: 1.5;
      outline: none;
      transition: border-color 0.2s;
    }

    .input:focus {
      border-color: var(--chat-primary);
    }

    .send {
      padding: 12px;
      background: var(--chat-primary);
      color: white;
      border: none;
      border-radius: var(--chat-radius);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 12px;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: var(--chat-text-light);
      border-radius: 50%;
      animation: bounce 1s infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>

  <div class="hidden chat-container">
    <header class="chat-header">
      <div class="status"></div>
      <div class="title">ThisWay Assistant</div>
      <button class="close-btn">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>

    <div class="messages"></div>

    <div class="chat-input">
      <form class="input-form">
        <input type="text" class="input" placeholder="Message ThisWay Assistant...">
        <button type="submit" class="send">
          <svg width="18" height="18" viewBox="0 0 24 24" style="stroke: white">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  </div>

  <button class="toggle-btn">
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>
`;

class ThisWayChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Bind methods
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleChat = this.toggleChat.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.setLoading = this.setLoading.bind(this);

    // Initialize state
    this.state = {
      messages: [],
      isLoading: false,
      isOpen: false,
    };
  }

  connectedCallback() {
    // Set up event listeners
    const form = this.shadowRoot.querySelector(".input-form");
    const toggleBtn = this.shadowRoot.querySelector(".toggle-btn");
    const closeBtn = this.shadowRoot.querySelector(".close-btn");

    form.addEventListener("submit", this.handleSubmit);
    toggleBtn.addEventListener("click", this.toggleChat);
    closeBtn.addEventListener("click", this.toggleChat);

    // Add initial message
    this.addMessage("Have questions about ThisWay? I'm here to help", "bot");
  }

  disconnectedCallback() {
    const form = this.shadowRoot.querySelector(".input-form");
    const toggleBtn = this.shadowRoot.querySelector(".toggle-btn");
    const closeBtn = this.shadowRoot.querySelector(".close-btn");

    form.removeEventListener("submit", this.handleSubmit);
    toggleBtn.removeEventListener("click", this.toggleChat);
    closeBtn.removeEventListener("click", this.toggleChat);
  }

  toggleChat() {
    this.state.isOpen = !this.state.isOpen;
    const container = this.shadowRoot.querySelector(".chat-container");
    container.classList.toggle("hidden");
  }

  setLoading(loading) {
    this.state.isLoading = loading;
    const send = this.shadowRoot.querySelector(".send");
    const input = this.shadowRoot.querySelector(".input");

    send.disabled = loading;
    input.disabled = loading;

    if (loading) {
      const loadingEl = document.createElement("div");
      loadingEl.className = "loading";
      loadingEl.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      `;
      this.shadowRoot.querySelector(".messages").appendChild(loadingEl);
    } else {
      const loading = this.shadowRoot.querySelector(".loading");
      if (loading) loading.remove();
    }
  }

  addMessage(content, type) {
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.innerHTML = `<div class="bubble">${content}</div>`;

    this.shadowRoot.querySelector(".messages").appendChild(message);
    message.scrollIntoView({ behavior: "smooth", block: "end" });

    this.state.messages.push({ content, type });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = this.shadowRoot.querySelector(".input");
    const message = input.value.trim();

    if (!message || this.state.isLoading) return;

    input.value = "";
    this.addMessage(message, "user");
    this.setLoading(true);

    // Create form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('message', message);

    try {
      const response = await fetch(
        "https://ssbx.dev-ai4jobs.com/rag/api/v1/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "*/*"
          },
          body: formData.toString()
        }
      );

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      this.addMessage(
        data.message || "Sorry, I couldn't process that.",
        "bot"
      );
    } catch (error) {
      console.error("Error:", error);
      this.addMessage("Sorry, something went wrong.", "bot");
    } finally {
      this.setLoading(false);
    }
  }
}

customElements.define("thisway-chat", ThisWayChat);

// chat-loader.js
(() => {
  // Only run once
  if (window.__THISWAY_CHAT_LOADED__) return;
  window.__THISWAY_CHAT_LOADED__ = true;

  // Create script element
  const script = document.createElement('script');
  script.src = '/chat/bubble.js';
  script.async = true;

  // Create web component element
  const chat = document.createElement('thisway-chat');

  // Function to inject elements
  const injectElements = () => {
    // Check if elements already exist
    if (!document.querySelector('script[src="/chat/bubble.js"]')) {
      document.head.appendChild(script);
    }
    
    if (!document.querySelector('thisway-chat')) {
      document.body.appendChild(chat);
    }
  };

  // Inject on DOMContentLoaded if not already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectElements);
  } else {
    injectElements();
  }

  // Handle script loading errors
  script.onerror = () => {
    console.error('Failed to load ThisWay chat component');
  };
})();
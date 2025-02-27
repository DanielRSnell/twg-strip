// orders-chat.js

// Configuration - Easy to manage static pieces
const CONFIG = {
  chatTitle: "TMW Brain",
  apiEndpoint: "https://umbralai.app.n8n.cloud/webhook/c9ac7867-c8b3-4b5a-8657-db90d6fa104c",
  sessionIdPrefix: "orders-session-",
  localStorageKey: "orders_session_id",
  initialMessage: "How can I help you with your orders today?"
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
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
      
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }

    .chat-container {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: var(--chat-font);
      background: var(--chat-bg);
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--chat-border);
      background: var(--chat-bg);
    }

    .status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      flex: 1;
    }

    .messages {
      flex: 1;
      padding: 24px;
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
      font-size: 15px;
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
      padding: 20px 24px;
      border-top: 1px solid var(--chat-border);
      background: var(--chat-bg);
    }

    .input-form {
      display: flex;
      gap: 12px;
      max-width: 960px;
      margin: 0 auto;
    }

    .input {
      flex: 1;
      padding: 14px 18px;
      border: 1px solid var(--chat-border);
      border-radius: var(--chat-radius);
      font-size: 15px;
      line-height: 1.5;
      outline: none;
      transition: border-color 0.2s;
    }

    .input:focus {
      border-color: var(--chat-primary);
    }

    .send {
      padding: 0 20px;
      background: var(--chat-primary);
      color: white;
      border: none;
      border-radius: var(--chat-radius);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      font-size: 15px;
      font-weight: 500;
    }

    .send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send svg {
      width: 18px;
      height: 18px;
      margin-left: 8px;
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

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .messages {
        padding: 16px;
      }
      
      .chat-input {
        padding: 16px;
      }
      
      .message {
        max-width: 90%;
      }
    }
  </style>

  <div class="chat-container">
    <header class="chat-header">
      <div class="status"></div>
      <div class="title">${CONFIG.chatTitle}</div>
    </header>

    <div class="messages"></div>

    <div class="chat-input">
      <form class="input-form">
        <input type="text" class="input" placeholder="Ask a question about your orders...">
        <button type="submit" class="send">
          Send
          <svg width="18" height="18" viewBox="0 0 24 24" style="stroke: white; fill: none">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  </div>
`;

class OrdersChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Bind methods
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.getSessionId = this.getSessionId.bind(this);

    // Initialize state
    this.state = {
      messages: [],
      isLoading: false,
      sessionId: this.getSessionId(),
    };
  }

  // Generate or retrieve session ID from localStorage
  getSessionId() {
    const storedSessionId = localStorage.getItem(CONFIG.localStorageKey);
    
    if (storedSessionId) {
      return storedSessionId;
    }
    
    // Generate a new session ID
    const newSessionId = CONFIG.sessionIdPrefix + Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // Store it in localStorage
    localStorage.setItem(CONFIG.localStorageKey, newSessionId);
    
    return newSessionId;
  }

  connectedCallback() {
    // Set up event listeners
    const form = this.shadowRoot.querySelector(".input-form");
    form.addEventListener("submit", this.handleSubmit);

    // Add initial message
    this.addMessage(CONFIG.initialMessage, "bot");
  }

  disconnectedCallback() {
    const form = this.shadowRoot.querySelector(".input-form");
    form.removeEventListener("submit", this.handleSubmit);
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

    try {
      // Prepare the payload according to your endpoint requirements
      const payload = {
        type: "messsage",
        input: message,
        session_id: this.state.sessionId,
        action: "simple_messsage"
      };

      const response = await fetch(
        CONFIG.apiEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      
      // Extract the output content from the response
      const botMessage = data.output || "Sorry, I couldn't process that.";
      this.addMessage(botMessage, "bot");
    } catch (error) {
      console.error("Error:", error);
      this.addMessage("Sorry, something went wrong.", "bot");
    } finally {
      this.setLoading(false);
    }
  }
}

customElements.define("orders-chat", OrdersChat);

// Usage example:
// <orders-chat></orders-chat>
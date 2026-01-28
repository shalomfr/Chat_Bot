// Chatbot Widget
// Embed this on any website using:
// <script src="https://your-domain.com/widget/chatbot.js" data-chatbot-id="xxx" async></script>

(function () {
  // Get configuration from script tag
  const script = document.currentScript as HTMLScriptElement;
  const chatbotId = script?.getAttribute("data-chatbot-id");

  if (!chatbotId) {
    console.error("Chatbot Widget: Missing data-chatbot-id attribute");
    return;
  }

  // Get API URL from script src
  const scriptSrc = script?.src || "";
  const apiUrl = scriptSrc.replace("/widget/chatbot.js", "");

  // Generate session ID
  const sessionId = `widget_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Styles
  const styles = `
    .chatbot-widget-container * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .chatbot-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--chatbot-primary, #3B82F6);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 9999;
    }

    .chatbot-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chatbot-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .chatbot-widget-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
    }

    .chatbot-widget-window.open {
      display: flex;
    }

    .chatbot-widget-header {
      background: var(--chatbot-primary, #3B82F6);
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chatbot-widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .chatbot-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .chatbot-widget-close:hover {
      opacity: 1;
    }

    .chatbot-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chatbot-widget-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .chatbot-widget-message.user {
      background: var(--chatbot-primary, #3B82F6);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .chatbot-widget-message.assistant {
      background: #f1f5f9;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .chatbot-widget-typing {
      display: flex;
      gap: 4px;
      padding: 12px 14px;
      background: #f1f5f9;
      border-radius: 12px;
      align-self: flex-start;
    }

    .chatbot-widget-typing span {
      width: 8px;
      height: 8px;
      background: #94a3b8;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .chatbot-widget-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-widget-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    .chatbot-widget-input-container {
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }

    .chatbot-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chatbot-widget-input:focus {
      border-color: var(--chatbot-primary, #3B82F6);
    }

    .chatbot-widget-send {
      background: var(--chatbot-primary, #3B82F6);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .chatbot-widget-send:hover {
      opacity: 0.9;
    }

    .chatbot-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .chatbot-widget-window {
        width: calc(100% - 20px);
        height: calc(100% - 100px);
        right: 10px;
        bottom: 80px;
      }
    }
  `;

  // Create widget HTML
  function createWidget() {
    // Add styles
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Create container
    const container = document.createElement("div");
    container.className = "chatbot-widget-container";

    // Create button
    const button = document.createElement("button");
    button.className = "chatbot-widget-button";
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;

    // Create window
    const window = document.createElement("div");
    window.className = "chatbot-widget-window";
    window.innerHTML = `
      <div class="chatbot-widget-header">
        <h3>צ'אט</h3>
        <button class="chatbot-widget-close">×</button>
      </div>
      <div class="chatbot-widget-messages"></div>
      <div class="chatbot-widget-input-container">
        <input type="text" class="chatbot-widget-input" placeholder="כתוב הודעה..." dir="auto">
        <button class="chatbot-widget-send">שלח</button>
      </div>
    `;

    container.appendChild(button);
    container.appendChild(window);
    document.body.appendChild(container);

    return { container, button, window };
  }

  // Initialize widget
  function init() {
    const { button, window } = createWidget();
    const messagesEl = window.querySelector(".chatbot-widget-messages") as HTMLElement;
    const inputEl = window.querySelector(".chatbot-widget-input") as HTMLInputElement;
    const sendBtn = window.querySelector(".chatbot-widget-send") as HTMLButtonElement;
    const closeBtn = window.querySelector(".chatbot-widget-close") as HTMLButtonElement;

    let isOpen = false;
    let isLoading = false;

    // Load chatbot settings and show welcome message
    loadChatbotSettings();

    async function loadChatbotSettings() {
      try {
        const res = await fetch(`${apiUrl}/api/widget/${chatbotId}`);
        if (res.ok) {
          const data = await res.json();

          // Set primary color
          if (data.primaryColor) {
            document.documentElement.style.setProperty("--chatbot-primary", data.primaryColor);
          }

          // Set title
          const headerTitle = window.querySelector(".chatbot-widget-header h3");
          if (headerTitle && data.name) {
            headerTitle.textContent = data.name;
          }

          // Show welcome message
          if (data.welcomeMessage) {
            addMessage("assistant", data.welcomeMessage);
          }
        }
      } catch (e) {
        console.error("Failed to load chatbot settings:", e);
      }
    }

    // Toggle window
    button.addEventListener("click", () => {
      isOpen = !isOpen;
      window.classList.toggle("open", isOpen);
      if (isOpen) {
        inputEl.focus();
      }
    });

    closeBtn.addEventListener("click", () => {
      isOpen = false;
      window.classList.remove("open");
    });

    // Send message
    async function sendMessage() {
      const message = inputEl.value.trim();
      if (!message || isLoading) return;

      inputEl.value = "";
      addMessage("user", message);

      isLoading = true;
      sendBtn.disabled = true;
      showTyping();

      try {
        const res = await fetch(`${apiUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId,
            chatbotId,
          }),
        });

        hideTyping();

        if (!res.ok) throw new Error("Chat error");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        const messageEl = addMessage("assistant", "");

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            assistantMessage += chunk;
            messageEl.textContent = assistantMessage;
            scrollToBottom();
          }
        }
      } catch (e) {
        hideTyping();
        addMessage("assistant", "מצטער, אירעה שגיאה. נסה שוב.");
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
      }
    }

    function addMessage(role: "user" | "assistant", content: string): HTMLElement {
      const messageEl = document.createElement("div");
      messageEl.className = `chatbot-widget-message ${role}`;
      messageEl.textContent = content;
      messagesEl.appendChild(messageEl);
      scrollToBottom();
      return messageEl;
    }

    function showTyping() {
      const typingEl = document.createElement("div");
      typingEl.className = "chatbot-widget-typing";
      typingEl.innerHTML = "<span></span><span></span><span></span>";
      typingEl.id = "chatbot-typing";
      messagesEl.appendChild(typingEl);
      scrollToBottom();
    }

    function hideTyping() {
      const typingEl = document.getElementById("chatbot-typing");
      if (typingEl) typingEl.remove();
    }

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

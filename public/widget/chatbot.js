(function(){var e=document.currentScript,t=e?.getAttribute("data-chatbot-id");if(!t){console.error("Chatbot Widget: Missing data-chatbot-id attribute");return}var a=(e?.src||"").replace("/widget/chatbot.js",""),i=`widget_${Date.now()}_${Math.random().toString(36).substring(2,15)}`,s=`
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
  `;function n(){var e=document.createElement("style");e.textContent=s,document.head.appendChild(e);var t=document.createElement("div");t.className="chatbot-widget-container";var a=document.createElement("button");a.className="chatbot-widget-button",a.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;var i=document.createElement("div");return i.className="chatbot-widget-window",i.innerHTML=`
      <div class="chatbot-widget-header">
        <h3>\u05E6'\u05D0\u05D8</h3>
        <button class="chatbot-widget-close">\xD7</button>
      </div>
      <div class="chatbot-widget-messages"></div>
      <div class="chatbot-widget-input-container">
        <input type="text" class="chatbot-widget-input" placeholder="\u05DB\u05EA\u05D5\u05D1 \u05D4\u05D5\u05D3\u05E2\u05D4..." dir="auto">
        <button class="chatbot-widget-send">\u05E9\u05DC\u05D7</button>
      </div>
    `,t.appendChild(a),t.appendChild(i),document.body.appendChild(t),{container:t,button:a,window:i}}function o(){var{button:e,window:s}=n(),l=s.querySelector(".chatbot-widget-messages"),c=s.querySelector(".chatbot-widget-input"),d=s.querySelector(".chatbot-widget-send"),u=s.querySelector(".chatbot-widget-close"),p=!1,g=!1;async function m(){try{var e=await fetch(`${a}/api/widget/${t}`);if(e.ok){var i=await e.json();i.primaryColor&&document.documentElement.style.setProperty("--chatbot-primary",i.primaryColor);var n=s.querySelector(".chatbot-widget-header h3");n&&i.name&&(n.textContent=i.name),i.welcomeMessage&&f("assistant",i.welcomeMessage)}}catch(e){console.error("Failed to load chatbot settings:",e)}}m(),e.addEventListener("click",()=>{p=!p,s.classList.toggle("open",p),p&&c.focus()}),u.addEventListener("click",()=>{p=!1,s.classList.remove("open")});async function h(){var e=c.value.trim();if(!(!e||g)){c.value="",f("user",e),g=!0,d.disabled=!0,b();try{var n=await fetch(`${a}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,sessionId:i,chatbotId:t})});if(w(),!n.ok)throw new Error("Chat error");var o=n.body?.getReader(),s=new TextDecoder,r="",l=f("assistant","");if(o)for(;;){var{done:u,value:p}=await o.read();if(u)break;var m=s.decode(p);r+=m,l.textContent=r,v()}}catch(e){w(),f("assistant","\u05DE\u05E6\u05D8\u05E2\u05E8, \u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4. \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1.")}finally{g=!1,d.disabled=!1}}}function f(e,t){var a=document.createElement("div");return a.className=`chatbot-widget-message ${e}`,a.textContent=t,l.appendChild(a),v(),a}function b(){var e=document.createElement("div");e.className="chatbot-widget-typing",e.innerHTML="<span></span><span></span><span></span>",e.id="chatbot-typing",l.appendChild(e),v()}function w(){var e=document.getElementById("chatbot-typing");e&&e.remove()}function v(){l.scrollTop=l.scrollHeight}d.addEventListener("click",h),c.addEventListener("keypress",e=>{e.key==="Enter"&&h()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o()})();

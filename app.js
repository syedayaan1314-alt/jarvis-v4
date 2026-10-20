(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const screens = ["lock", "home", "chat", "voice", "tools", "settings"];
  const FIXED_PIN = "0103";
  let pin = "", pinMode = "unlock", listening = false;
  const toast = (message) => {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
  };
  const showScreen = (name) => {
    if (!screens.includes(name)) name = "home";
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === `screen-${name}`));
    $$(".nav-item").forEach(b => b.classList.toggle("selected", b.dataset.screen === name));
    if (name === "chat") setTimeout(() => $("#chatInput").focus(), 100);
    if (name === "home") updateClock();
    window.scrollTo({top: 0, behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth"});
  };
  $$("[data-screen]").forEach(el => el.addEventListener("click", e => {
    const name = el.dataset.screen;
    if (name && el.tagName === "A") return;
    e.preventDefault(); showScreen(name);
  }));
  $("#settingsTop").addEventListener("click", () => showScreen("settings"));

  function updateDots() {
    $$("#pinDots i").forEach((dot, i) => dot.classList.toggle("filled", i < pin.length));
  }
  function setLockMode(mode) {
    pinMode = "unlock"; pin = ""; updateDots();
    $("#lockTitle").textContent = "Welcome back, Sir.";
    $("#lockHint").textContent = "Enter your access code to initialize JARVIS.";
    $("#lockFoot").textContent = "ENTER YOUR 4-DIGIT ACCESS CODE";
  }
  function enterPin() {
    if (pin.length !== 4) { toast("Enter all 4 digits first."); return; }
    if (pin === FIXED_PIN) { showScreen("home"); toast("Access granted."); }
    else { pin = ""; updateDots(); toast("Incorrect code. Try again."); }
  }
  $("#keypad").addEventListener("click", e => {
    const button = e.target.closest("button[data-key]"); if (!button) return;
    const key = button.dataset.key;
    if (key === "clear") { pin = ""; updateDots(); return; }
    if (key === "enter") { enterPin(); return; }
    if (/^\d$/.test(key) && pin.length < 4) { pin += key; updateDots(); if (pin.length === 4 && pinMode === "unlock") setTimeout(enterPin, 180); }
  });
  $("#resetPin").addEventListener("click", () => {
    toast("The access code is fixed to 0103 in this version.");
  });
  $("#lockNow").addEventListener("click", () => { setLockMode("unlock"); showScreen("lock"); });
  setLockMode("unlock");

  function updateClock() {
    const now = new Date();
    $("#clock").textContent = now.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    $("#dateLine").textContent = now.toLocaleDateString([], {weekday:"short", month:"short", day:"numeric"}).toUpperCase();
  }
  updateClock(); setInterval(updateClock, 30000);

  const messages = $("#messages");
  function addMessage(role, text) {
    const item = document.createElement("div"); item.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;
    const label = document.createElement("span"); label.className = "message-label"; label.textContent = role === "user" ? "YOU" : "JARVIS";
    const p = document.createElement("p"); p.textContent = text; item.append(label, p); messages.appendChild(item); messages.scrollTop = messages.scrollHeight; return p;
  }
  function localDemoReply(text) {
    const q = text.toLowerCase();
    if (/\b(hi|hello|hey|good morning|good evening)\b/.test(q)) return "Hello, Sir. JARVIS local demo mode is online. I can answer a few built-in prompts, but I don't have a connected AI model in this mode.";
    if (q.includes("time") || q.includes("date")) return `The current date and time on this device is ${new Date().toLocaleString()}.`;
    if (q.includes("who are you") || q.includes("your name")) return "I am JARVIS, your personal assistant interface. This version is running in local demo mode without a cloud AI connection.";
    if (q.includes("help") || q.includes("what can you do")) return "In local demo mode I can greet you, show the device date/time, and respond to a few built-in prompts. For open-ended intelligent answers, a configured AI service is required.";
    if (q.includes("joke")) return "Why did the computer go to the doctor? It had a virus. (Demo response)";
    if (q.includes("thank")) return "You're welcome, Sir.";
    if (q.includes("open youtube")) return "Use the YouTube shortcut on the JARVIS home screen to open YouTube.";
    return "I received your message, Sir. I'm currently in local demo mode, so I can't generate a full AI answer without an AI service. Try asking for the time, saying hello, or asking 'what can you do?'";
  }

  async function askJarvis(text) {
    addMessage("user", text); $("#chatInput").value = "";
    const answerEl = addMessage("assistant", "Connecting to the AI core…");
    $("#apiStatus").textContent = "REQUEST IN PROGRESS";
    try {
      const response = await fetch("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:text})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The AI endpoint returned an error.");
      const answer = data.reply || "I didn't receive a reply. Please try again.";
      answerEl.textContent = answer; $("#apiStatus").textContent = "CONNECTED";
      if ($("#speechToggle").checked && "speechSynthesis" in window) speak(answer);
    } catch (err) {
      // Offline/demo fallback: works without a Gemini API key, but is not a full AI model.
      const answer = localDemoReply(text);
      answerEl.textContent = answer;
      $("#apiStatus").textContent = "LOCAL DEMO MODE";
      if ($("#speechToggle").checked && "speechSynthesis" in window) speak(answer);
    }
    messages.scrollTop = messages.scrollHeight;
  }
  $("#chatForm").addEventListener("submit", e => {
    e.preventDefault(); const text = $("#chatInput").value.trim(); if (text) askJarvis(text);
  });
  $("#chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm").requestSubmit(); }
  });
  $$(".suggestions button").forEach(b => b.addEventListener("click", () => { $("#chatInput").value = b.dataset.prompt; $("#chatForm").requestSubmit(); }));
  $("#clearChat").addEventListener("click", () => { messages.replaceChildren(); addMessage("assistant", "Conversation cleared. How can I help, Sir?"); });
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 1; utterance.pitch = .95; window.speechSynthesis.speak(utterance);
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  $("#micButton").addEventListener("click", () => {
    if (!SpeechRecognition) { toast("Voice recognition is not supported here. Try Chrome or type instead."); return; }
    if (listening && window.jarvisRecognition) { window.jarvisRecognition.stop(); return; }
    const recognition = new SpeechRecognition(); window.jarvisRecognition = recognition;
    recognition.lang = navigator.language || "en-US"; recognition.interimResults = true; recognition.continuous = false;
    listening = true; $("#voiceOrb").classList.add("listening"); $("#voiceTitle").textContent = "Listening…"; $("#voiceHint").textContent = "Speak clearly. Tap the button to stop.";
    $("#micButton").innerHTML = "<span>■</span> Stop listening";
    recognition.onresult = e => {
      const transcript = [...e.results].map(r => r[0].transcript).join("");
      $("#voiceTranscript").textContent = transcript;
      if (e.results[e.results.length - 1].isFinal) {
        $("#voiceTranscript").textContent = transcript; listening = false; $("#voiceOrb").classList.remove("listening");
        $("#voiceTitle").textContent = "Request captured."; $("#voiceHint").textContent = "Sending your request to JARVIS…"; $("#micButton").innerHTML = "<span>🎙</span> Start listening";
        showScreen("chat"); $("#chatInput").value = transcript; $("#chatForm").requestSubmit();
      }
    };
    recognition.onerror = e => { toast(`Voice error: ${e.error}`); stopListening(); };
    recognition.onend = () => { if (listening) stopListening(); };
    recognition.start();
  });
  function stopListening() {
    listening = false; $("#voiceOrb").classList.remove("listening"); $("#voiceTitle").textContent = "Ready when you are."; $("#voiceHint").textContent = "Tap the microphone and speak naturally."; $("#micButton").innerHTML = "<span>🎙</span> Start listening";
  }
  $("#speechToggle").addEventListener("change", e => { if (!e.target.checked && "speechSynthesis" in window) speechSynthesis.cancel(); });
  $("#motionToggle").addEventListener("change", e => document.body.classList.toggle("reduce-motion", e.target.checked));

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
})();
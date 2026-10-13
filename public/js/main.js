(function () {
  const chatForm = document.getElementById("chat-form");
  const msgInput = document.getElementById("msg");
  const chatMessages = document.getElementById("messages");
  const roomName = document.getElementById("room-name");
  const roomTitle = document.getElementById("room-title");
  const userList = document.getElementById("users");
  const usersCount = document.getElementById("users-count");
  const typingEl = document.getElementById("typing");
  const scrollDownBtn = document.getElementById("scroll-down");
  const statusEl = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  const params = new URLSearchParams(location.search);
  const username = (params.get("username") || "").trim();
  const room = params.get("room") || "";

  if (!username || !room) {
    location.replace("index.html");
    return;
  }

  roomTitle.textContent = room;
  roomName.textContent = room;
  document.title = `${room} | چت یاد`;

  const socket = io();
  const typingUsers = new Map();


  function initial(name) {
    return Array.from(name)[0]?.toUpperCase() || "?";
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isNearBottom() {
    return (
      chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 80
    );
  }

  function scrollToBottom(smooth = true) {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    scrollDownBtn.classList.remove("show");
  }

  function setStatus(state, text) {
    statusEl.dataset.state = state;
    statusText.textContent = text;
  }

  function showOverlay(text) {
    overlayText.textContent = text;
    overlay.hidden = false;
  }


  socket.on("connect", () => {
    setStatus("online", "متصل");
    socket.emit("joinRoom", { username, room });
  });

  socket.on("disconnect", () => {
    setStatus("offline", "قطع شد");
    typingUsers.clear();
    renderTyping();
  });

  socket.io.on("reconnect_attempt", () => setStatus("connecting", "در حال اتصال…"));

  socket.on("joinError", (text) => {
    showOverlay(text);
    socket.disconnect();
  });

  socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);

    const ids = new Set(users.map((u) => u.id));
    for (const id of typingUsers.keys()) {
      if (!ids.has(id)) typingUsers.delete(id);
    }
    renderTyping();
  });

  socket.on("message", (message) => {
    const stick = isNearBottom();
    const own = message.id === socket.id;

    if (message.id) typingUsers.delete(message.id);
    renderTyping();

    outputMessage(message, own);

    if (own || stick) {
      scrollToBottom();
    } else {
      scrollDownBtn.classList.add("show");
    }
  });

  socket.on("typing", ({ id, username }) => {
    typingUsers.set(id, username);
    renderTyping();
  });

  socket.on("stopTyping", ({ id }) => {
    typingUsers.delete(id);
    renderTyping();
  });


  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = msgInput.value.trim();
    if (!message) return;

    socket.emit("ChatMessage", message);
    stopTyping();

    msgInput.value = "";
    msgInput.focus();
  });

  let typingTimer = null;
  let isTyping = false;

  function stopTyping() {
    clearTimeout(typingTimer);
    if (isTyping) {
      isTyping = false;
      socket.emit("stopTyping");
    }
  }

  msgInput.addEventListener("input", () => {
    if (!msgInput.value.trim()) return stopTyping();
    if (!isTyping) {
      isTyping = true;
      socket.emit("typing");
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(stopTyping, 1500);
  });


  function outputMessage(message, own) {
    if (message.type === "system") {
      const sys = el("div", "message system");
      sys.appendChild(el("span", "system-pill", message.text));
      chatMessages.appendChild(sys);
      return;
    }

    const wrap = el("div", "message " + (own ? "own" : "other"));
    wrap.style.setProperty("--hue", message.hue);

    if (!own) {
      wrap.appendChild(el("div", "avatar", initial(message.username)));
    }

    const bubble = el("div", "bubble");

    const meta = el("div", "meta");
    if (!own) meta.appendChild(el("span", "name", message.username));
    meta.appendChild(el("span", "time", formatTime(message.timestamp)));
    bubble.appendChild(meta);

    const text = el("div", "text", message.text);
    text.dir = "auto";
    bubble.appendChild(text);

    wrap.appendChild(bubble);
    chatMessages.appendChild(wrap);
  }

  function outputRoomName(room) {
    roomName.textContent = room;
    roomTitle.textContent = room;
  }

  function outputUsers(users) {
    userList.innerHTML = "";
    usersCount.textContent = users.length.toLocaleString("fa-IR");

    users.forEach((user) => {
      const li = el("li", "user-item");
      li.style.setProperty("--hue", user.hue);

      li.appendChild(el("div", "avatar sm", initial(user.username)));
      li.appendChild(el("span", "user-name", user.username));
      if (user.id === socket.id) li.appendChild(el("span", "me-tag", "شما"));
      li.appendChild(el("i", "online-dot"));

      userList.appendChild(li);
    });
  }

  function renderTyping() {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) {
      typingEl.innerHTML = "";
      return;
    }

    let text;
    if (names.length === 1) text = `${names[0]} در حال نوشتن`;
    else if (names.length === 2) text = `${names[0]} و ${names[1]} در حال نوشتن`;
    else text = "چند نفر در حال نوشتن";

    typingEl.innerHTML = "";
    const dots = el("span", "dots");
    dots.append(el("i"), el("i"), el("i"));
    typingEl.append(dots, el("span", "", text));
  }


  scrollDownBtn.addEventListener("click", () => scrollToBottom());
  chatMessages.addEventListener("scroll", () => {
    if (isNearBottom()) scrollDownBtn.classList.remove("show");
  });

  function toggleSidebar(open) {
    sidebar.classList.toggle("open", open);
    sidebarBackdrop.classList.toggle("show", open);
  }
  sidebarToggle.addEventListener("click", () =>
    toggleSidebar(!sidebar.classList.contains("open"))
  );
  sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));

  msgInput.focus();
})();
# CS Gap

A small real-time chat room app built with **Node.js**, **Express** and **Socket.IO**. Pick a username, join a topic room, and chat live with everyone in it.<br>

### Join page

![Join page](/screenshots/join.png)

### Chat (light)

![Chat light theme](/screenshots/chat-light.png)

### Chat (dark)
![Chat dark theme](/screenshots/chat-dark.png)

## Features

- Real-time messaging with separate rooms
- Live list of online users per room, updated on join / leave
- Your messages appear on the opposite side with a distinct colour
- Unique colour and avatar for each user
- Typing indicator and connection status
- Fixed-size chat box that scrolls internally
- Light / dark theme (remembered between visits)
- Responsive layout with RTL (Persian) support
- Basic protection: HTML is escaped (no XSS), input is validated on the server, duplicate usernames in a room are rejected

## Tech Stack

- [Node.js](https://nodejs.org/) 18+
- [Express](https://expressjs.com/) 5
- [Socket.IO](https://socket.io/) 4
- Vanilla HTML, CSS and JavaScript on the front end

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# or, with auto-reload during development
npm run serve
```

Then open <http://localhost:8080> in your browser. Open it in a second tab (with a different username) to try the chat.

## Configuration

Create or edit the `.env` file in the project root:

```env
PORT=8080
```

If `PORT` is not set, the app falls back to `8080`.

## Project Structure

```
Chatroom/
├── app.js                  # Express + Socket.IO server
├── services/
│   └── user.service.js     # In-memory user management
├── utils/
│   └── message.format.js   # Message payload builder
└── public/
    ├── index.html          # Join page
    ├── chat.html           # Chat page
    ├── css/style.css
    └── js/
        ├── main.js         # Chat client logic
        └── theme.js        # Light / dark theme
```

## Customizing Rooms

Rooms are defined in two places, which must be kept in sync:

1. The `<option>` list in `public/index.html`
2. The `ALLOWED_ROOMS` array in `app.js`

## Notes

- Users and messages are stored in memory only, so everything resets when the server restarts.
- Icons and fonts are loaded from CDNs (Font Awesome and Google Fonts), so an internet connection is required.


## License

This project is licensed under the **ISC License**.


## Author

Amirhosein Pourmand

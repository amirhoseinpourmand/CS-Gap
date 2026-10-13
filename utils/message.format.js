function formatMessage(username, text, { id = null, type = "user", hue = 0 } = {}) {
  return {
    id,
    type,
    hue,
    username,
    text,
    timestamp: Date.now(),
  };
}

module.exports = formatMessage;
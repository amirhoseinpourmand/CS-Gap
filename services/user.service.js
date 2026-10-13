const users = [];
let colorCounter = 0;

function nextHue() {
  return Math.round((colorCounter++ * 137.508) % 360);
}

function userJoin(id, username, room) {
  const user = { id, username, room, hue: nextHue() };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function isUsernameTaken(username, room) {
  const name = username.toLowerCase();
  return users.some(
    (user) => user.room === room && user.username.toLowerCase() === name
  );
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  isUsernameTaken,
  userLeave,
};
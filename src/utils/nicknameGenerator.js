const { adjectives, nouns, avatarEmojis } = require('../config/constants');

function generateNickname() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adj + noun;
}

function generateAvatarEmoji() {
  return avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = {
  generateNickname,
  generateAvatarEmoji,
  generateSessionToken
};

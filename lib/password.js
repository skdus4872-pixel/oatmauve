const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function isAdminPassword(password) {
  const adminPassword = process.env.BOARD_ADMIN_PASSWORD;
  return !!adminPassword && String(password) === adminPassword;
}

function matchesPost(password, post) {
  if (!password) return false;
  if (isAdminPassword(password)) return true;
  if (!post.salt || !post.passwordHash) return false;
  return hashPassword(password, post.salt) === post.passwordHash;
}

module.exports = { hashPassword, isAdminPassword, matchesPost };

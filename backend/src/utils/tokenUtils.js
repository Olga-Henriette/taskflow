const jwt = require('jsonwebtoken');

/**
 * Génère un Access Token (courte durée - 15 minutes)
 * @param {Object} payload - Données à inclure dans le token (userId, email)
 * @returns {String} Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Génère un Refresh Token (longue durée - 7 jours)
 * @param {Object} payload - Données à inclure dans le token
 * @returns {String} Token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Vérifie et décode un Access Token
 * @param {String} token - Token à vérifier
 * @returns {Object} Données décodées du token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Vérifie et décode un Refresh Token
 * @param {String} token - Token à vérifier
 * @returns {Object} Données décodées du token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
};

/**
 * Génère les deux tokens (access + refresh)
 * @param {Object} user - Objet utilisateur
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens
};
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * MIDDLEWARE D'AUTHENTIFICATION
 * Vérifie que l'utilisateur est connecté avant d'accéder à une route protégée
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }
    
    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);
    
    // 2. Vérifier et décoder le token
    const decoded = verifyAccessToken(token);
    
    // 3. Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier que le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez le support.'
      });
    }
    
    // 4. Attacher l'utilisateur à la requête (disponible dans les controllers)
    req.user = user;
    
    // 5. Passer au prochain middleware ou controller
    next();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      error: error.message
    });
  }
};

/**
 * MIDDLEWARE OPTIONNEL D'AUTHENTIFICATION
 * Attache l'utilisateur s'il est connecté, mais n'empêche pas l'accès
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue quand même (auth optionnelle)
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
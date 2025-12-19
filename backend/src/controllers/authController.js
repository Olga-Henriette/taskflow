const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/tokenUtils');

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    // 1. Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // 2. Créer le nouvel utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password // Sera automatiquement hashé par le middleware du modèle
    });
    
    await user.save();
    
    // 3. Générer les tokens
    const tokens = generateTokens(user);
    
    // 4. Retourner la réponse
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        },
        ...tokens
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

/**
 * @desc    Connexion utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Vérifier que l'email et password sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }
    
    // 2. Chercher l'utilisateur (avec le password cette fois)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // 3. Vérifier que le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez le support.'
      });
    }
    
    // 4. Comparer les mots de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // 5. Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();
    
    // 6. Générer les tokens
    const tokens = generateTokens(user);
    
    // 7. Retourner la réponse (sans le password)
    const userResponse = user.toJSON();
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userResponse,
        ...tokens
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir le profil utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private (nécessite authentification)
 */
exports.getMe = async (req, res) => {
  try {
    // req.user est attaché par le middleware authMiddleware
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Erreur getMe:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

/**
 * @desc    Rafraîchir l'access token avec le refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token manquant'
      });
    }
    
    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou compte désactivé'
      });
    }
    
    // Générer de nouveaux tokens
    const tokens = generateTokens(user);
    
    res.status(200).json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: tokens
    });
    
  } catch (error) {
    console.error('Erreur refresh token:', error);
    
    res.status(401).json({
      success: false,
      message: 'Refresh token invalide ou expiré',
      error: error.message
    });
  }
};

/**
 * @desc    Déconnexion utilisateur 
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {    
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Erreur logout:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: error.message
    });
  }
};
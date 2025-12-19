const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * VALIDATIONS
 * Règles de validation pour chaque route
 */

// Validation pour l'inscription
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir entre 2 et 50 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit avoir entre 2 et 50 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Le numéro de téléphone est obligatoire')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Numéro de téléphone invalide'),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit avoir au moins 8 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
];

// Validation pour le refresh token
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token manquant')
];

/**
 * ROUTES PUBLIQUES (pas besoin d'être connecté)
 */

// POST /api/auth/register - Inscription
router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

// POST /api/auth/login 
router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

// POST /api/auth/refresh - Rafraîchir le token
router.post(
  '/refresh',
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

/**
 * ROUTES PRIVÉES (nécessitent authentification)
 */

// GET /api/auth/me - Obtenir son profil
router.get(
  '/me',
  authMiddleware,
  authController.getMe
);

// POST /api/auth/logout 
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

module.exports = router;
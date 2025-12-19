const { validationResult } = require('express-validator');

/**
 * MIDDLEWARE DE VALIDATION
 * Vérifie les erreurs de validation et retourne un message propre
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formater les erreurs de manière lisible
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: formattedErrors
    });
  }
  
  // Si pas d'erreurs, passer au prochain middleware/controller
  next();
};

module.exports = { validate };
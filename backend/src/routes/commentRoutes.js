const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

/**
 * TOUTES LES ROUTES NÉCESSITENT UNE AUTHENTIFICATION
 */
router.use(authMiddleware);

/**
 * ROUTES COMMENTAIRES
 * Base: /api/tickets/:ticketId/comments
 */

// GET /api/tickets/:ticketId/comments - Liste des commentaires
router.get(
  '/',
  commentController.getTicketComments
);

// POST /api/tickets/:ticketId/comments - Créer un commentaire
router.post(
  '/',
  [
    body('content')
      .trim()
      .notEmpty().withMessage('Le contenu du commentaire est obligatoire')
      .isLength({ min: 1, max: 2000 }).withMessage('Le commentaire doit avoir entre 1 et 2000 caractères')
  ],
  validate,
  commentController.createComment
);

// PUT /api/tickets/:ticketId/comments/:id - Modifier un commentaire
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID commentaire invalide'),
    body('content')
      .trim()
      .notEmpty().withMessage('Le contenu du commentaire est obligatoire')
      .isLength({ min: 1, max: 2000 }).withMessage('Le commentaire doit avoir entre 1 et 2000 caractères')
  ],
  validate,
  commentController.updateComment
);

// DELETE /api/tickets/:ticketId/comments/:id - Supprimer un commentaire
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID commentaire invalide')],
  validate,
  commentController.deleteComment
);

module.exports = router;
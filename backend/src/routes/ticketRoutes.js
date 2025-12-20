const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

/**
 * VALIDATIONS
 */

// Validation pour créer un ticket
const createTicketValidation = [
  param('projectId')
    .isMongoId().withMessage('ID projet invalide'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit avoir entre 3 et 200 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La description ne peut pas dépasser 5000 caractères'),
  
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'review', 'done']).withMessage('Statut invalide'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorité invalide'),
  
  body('estimatedDate')
    .notEmpty().withMessage('La date d\'estimation est obligatoire')
    .isISO8601().withMessage('Date invalide'),
  
  body('assignees')
    .optional()
    .isArray().withMessage('Les assignés doivent être un tableau'),
  
  body('assignees.*')
    .optional()
    .isMongoId().withMessage('ID utilisateur invalide dans les assignés'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Les tags doivent être un tableau')
];

// Validation pour mettre à jour un ticket
const updateTicketValidation = [
  param('id')
    .isMongoId().withMessage('ID ticket invalide'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit avoir entre 3 et 200 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La description ne peut pas dépasser 5000 caractères'),
  
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'review', 'done']).withMessage('Statut invalide'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorité invalide'),
  
  body('estimatedDate')
    .optional()
    .isISO8601().withMessage('Date invalide'),
  
  body('assignees')
    .optional()
    .isArray().withMessage('Les assignés doivent être un tableau'),
  
  body('assignees.*')
    .optional()
    .isMongoId().withMessage('ID utilisateur invalide dans les assignés')
];

// Validation pour assigner des utilisateurs
const assignValidation = [
  param('id')
    .isMongoId().withMessage('ID ticket invalide'),
  
  body('userIds')
    .isArray({ min: 1 }).withMessage('Vous devez fournir au moins un utilisateur'),
  
  body('userIds.*')
    .isMongoId().withMessage('ID utilisateur invalide')
];

/**
 * TOUTES LES ROUTES NÉCESSITENT UNE AUTHENTIFICATION
 */
router.use(authMiddleware);

/**
 * ROUTES CRUD TICKETS
 */

// GET /api/tickets/projects/:projectId - Récupérer tous les tickets d'un projet
router.get(
  '/projects/:projectId',
  [param('projectId').isMongoId().withMessage('ID projet invalide')],
  validate,
  ticketController.getProjectTickets
);

// GET /api/tickets/:id 
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID ticket invalide')],
  validate,
  ticketController.getTicketById
);

// POST /api/tickets/projects/:projectId - Créer un nouveau ticket
router.post(
  '/projects/:projectId',
  createTicketValidation,
  validate,
  ticketController.createTicket
);

// PUT /api/tickets/:id 
router.put(
  '/:id',
  updateTicketValidation,
  validate,
  ticketController.updateTicket
);

// DELETE /api/tickets/:id 
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID ticket invalide')],
  validate,
  ticketController.deleteTicket
);

/**
 * ROUTES ASSIGNATION
 */

// POST /api/tickets/:id/assign - Assigner des utilisateurs au ticket
router.post(
  '/:id/assign',
  assignValidation,
  validate,
  ticketController.assignTicket
);

// DELETE /api/tickets/:id/assign/:userId 
router.delete(
  '/:id/assign/:userId',
  [
    param('id').isMongoId().withMessage('ID ticket invalide'),
    param('userId').isMongoId().withMessage('ID utilisateur invalide')
  ],
  validate,
  ticketController.unassignTicket
);

/**
 * ROUTES COMMENTAIRES (imbriquées)
 */
const commentRoutes = require('./commentRoutes');
router.use('/:ticketId/comments', commentRoutes);

module.exports = router;
const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');

const router = express.Router();

/**
 * VALIDATIONS
 */

// Validation for creating project
const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
];

// Validation for updating project
const updateProjectValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
];

// Validation for adding/removing members
const memberValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID'),
  
  body('userId')
    .isMongoId().withMessage('Invalid user ID')
];

// Validation for removing member (from params)
const removeMemberValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID'),
  
  param('userId')
    .isMongoId().withMessage('Invalid user ID')
];

/**
 * ALL ROUTES REQUIRE AUTHENTICATION
 */
router.use(authMiddleware);

/**
 * PROJECT CRUD ROUTES
 */

// GET /api/projects - Get all projects
router.get(
  '/',
  projectController.getAllProjects
);

// GET /api/projects/:id - Get single project
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  projectController.getProjectById
);

// POST /api/projects - Create new project
router.post(
  '/',
  createProjectValidation,
  validate,
  projectController.createProject
);

// PUT /api/projects/:id - Update project
router.put(
  '/:id',
  updateProjectValidation,
  validate,
  projectController.updateProject
);

// DELETE /api/projects/:id - Delete project
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  projectController.deleteProject
);

/**
 * TEAM MANAGEMENT ROUTES
 */

// POST /api/projects/:id/admins - Add admin
router.post(
  '/:id/admins',
  memberValidation,
  validate,
  projectController.addAdmin
);

// DELETE /api/projects/:id/admins/:userId - Remove admin
router.delete(
  '/:id/admins/:userId',
  removeMemberValidation,
  validate,
  projectController.removeAdmin
);

// POST /api/projects/:id/members - Add member
router.post(
  '/:id/members',
  memberValidation,
  validate,
  projectController.addMember
);

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete(
  '/:id/members/:userId',
  removeMemberValidation,
  validate,
  projectController.removeMember
);

module.exports = router;
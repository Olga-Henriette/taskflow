const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);

// GET /api/users/search?email=xxx
router.get('/search', userController.searchUserByEmail);

module.exports = router;
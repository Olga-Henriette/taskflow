const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');

/**
 * @desc    Récupérer tous les commentaires d'un ticket
 * @route   GET /api/tickets/:ticketId/comments
 * @access  Private (Membres du projet)
 */
exports.getTicketComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId || req.params.id;
    const { page = 1, limit = 20 } = req.query;
    
    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    // Vérifier l'accès au projet
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce ticket'
      });
    }
    
    // Calculer la pagination
    const skip = (page - 1) * limit;
    
    // Récupérer les commentaires
    const comments = await Comment.find({ ticketId })
      .populate('author', 'firstName lastName email avatar')
      .sort({ createdAt: -1 }) // Plus récents en premier
      .skip(skip)
      .limit(parseInt(limit));
    
    // Compter le total
    const total = await Comment.countDocuments({ ticketId });
    
    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau commentaire
 * @route   POST /api/tickets/:ticketId/comments
 * @access  Private (Membres du projet)
 */
exports.createComment = async (req, res) => {
  try {
    const ticketId = req.params.ticketId || req.params.id;
    const { content } = req.body;
    
    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    // Vérifier l'accès au projet
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous devez être membre du projet pour commenter'
      });
    }
    
    // Créer le commentaire
    const comment = new Comment({
      ticketId,
      author: req.user._id,
      content
    });
    
    await comment.save();
    
    // Peupler les données de l'auteur
    await comment.populate('author', 'firstName lastName email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Commentaire créé avec succès',
      data: comment
    });
    
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du commentaire',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un commentaire
 * @route   PUT /api/comments/:id
 * @access  Private (Auteur uniquement)
 */
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }
    
    // Seul l'auteur peut modifier son commentaire
    if (!comment.isAuthor(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'auteur peut modifier ce commentaire'
      });
    }
    
    // Mettre à jour le contenu
    comment.content = content;
    await comment.save();
    
    // Peupler les données de l'auteur
    await comment.populate('author', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Commentaire modifié avec succès',
      data: comment
    });
    
  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du commentaire',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un commentaire
 * @route   DELETE /api/comments/:id
 * @access  Private (Auteur uniquement)
 */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }
    
    // Seul l'auteur peut supprimer son commentaire
    if (!comment.isAuthor(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'auteur peut supprimer ce commentaire'
      });
    }
    
    await comment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
};
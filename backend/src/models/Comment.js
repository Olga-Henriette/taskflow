const mongoose = require('mongoose');

/**
 * COMMENT SCHEMA
 * Définit la structure d'un commentaire dans MongoDB
 */
const commentSchema = new mongoose.Schema({
  // Association au ticket (obligatoire)
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Le commentaire doit être associé à un ticket']
  },
  
  // Auteur du commentaire
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le commentaire doit avoir un auteur']
  },
  
  // Contenu du commentaire
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est obligatoire'],
    trim: true,
    minlength: [1, 'Le commentaire ne peut pas être vide'],
    maxlength: [2000, 'Le commentaire ne peut pas dépasser 2000 caractères']
  },
  
  // Édition
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date,
  
  // Support pour les threads 
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }

}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

/**
 * INDEXES
 * Améliore les performances des requêtes
 */
commentSchema.index({ ticketId: 1, createdAt: -1 }); // Pour récupérer les commentaires d'un ticket triés par date
commentSchema.index({ author: 1 }); // Pour récupérer les commentaires d'un auteur

/**
 * METHOD: Vérifier si l'utilisateur est l'auteur
 */
commentSchema.methods.isAuthor = function(userId) {
  return this.author.toString() === userId.toString();
};

/**
 * PRE-SAVE MIDDLEWARE
 * Marque si c'est un nouveau commentaire
 */
commentSchema.pre('save', function() {
  // Si le contenu a été modifié après la création
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
 
  // Marque si c'est un nouveau document (avant la sauvegarde)
  this.wasNew = this.isNew;
});

/**
 * POST-SAVE MIDDLEWARE
 * Met à jour le compteur de commentaires du ticket
 */
commentSchema.post('save', async function(doc) {
  try {
    // Si c'était un nouveau commentaire
    if (doc.wasNew) {
      const Ticket = mongoose.model('Ticket');
      const ticket = await Ticket.findById(doc.ticketId);
      
      if (ticket) {
        // Incrémente le compteur
        ticket.commentsCount += 1;
        await ticket.save();
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de commentaires:', error);
  }
});

/**
 * POST-DELETE MIDDLEWARE
 * Met à jour le compteur de commentaires après suppression
 */
commentSchema.post('deleteOne', { document: true, query: false }, async function() {
  try {
    const Ticket = mongoose.model('Ticket');
    const ticket = await Ticket.findById(this.ticketId);
    
    if (ticket) {
      // Recompte les commentaires
      const count = await mongoose.model('Comment').countDocuments({
        ticketId: this.ticketId
      });
      
      ticket.commentsCount = count;
      await ticket.save();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur après suppression:', error);
  }
});

/**
 * CUSTOM JSON FORMAT
 */
commentSchema.methods.toJSON = function() {
  const comment = this.toObject();
  delete comment.__v;
  return comment;
};

module.exports = mongoose.model('Comment', commentSchema);
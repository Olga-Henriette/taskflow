const mongoose = require('mongoose');

/**
 * SCHEMA PROJET
 * Définit la structure d'un projet dans MongoDB
 */
const projectSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'archived'],
      message: 'Status must be: active, inactive, or archived'
    },
    default: 'active'
  },
  
  // Team management
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project must have an owner']
  },
  
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Project settings
  settings: {
    visibility: {
      type: String,
      enum: ['private', 'team'],
      default: 'private'
    },
    allowGuestComments: {
      type: Boolean,
      default: false
    },
    defaultTicketStatus: {
      type: String,
      default: 'todo'
    }
  },
  
  // Statistics (denormalized for performance)
  stats: {
    totalTickets: {
      type: Number,
      default: 0
    },
    completedTickets: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 1
    }
  },
  
  // Metadata
  archivedAt: Date

}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

/**
 * INDEX
 * Pour améliorer les performances des recherches
 */
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ admins: 1 });
projectSchema.index({ name: 'text', description: 'text' }); // Full-text search

/**
 * VIRTUAL: Get all team members (owner + admins + members)
 */
projectSchema.virtual('allMembers').get(function() {
  const allIds = [
    this.owner.toString(),
    ...this.admins.map(id => id.toString()),
    ...this.members.map(id => id.toString())
  ];
  
  // Supprime les doublons
  return [...new Set(allIds)];
});

/**
 * METHOD: Check if user is owner
 */
projectSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

/**
 * METHOD: Check if user is admin
 */
projectSchema.methods.isAdmin = function(userId) {
  return this.admins.some(adminId => adminId.toString() === userId.toString());
};

/**
 * METHOD: Check if user is member
 */
projectSchema.methods.isMember = function(userId) {
  return this.members.some(memberId => memberId.toString() === userId.toString());
};

/**
 * METHOD: Check if user has access to project
 */
projectSchema.methods.hasAccess = function(userId) {
  const userIdStr = userId.toString();
  return (
    this.owner.toString() === userIdStr ||
    this.admins.some(id => id.toString() === userIdStr) ||
    this.members.some(id => id.toString() === userIdStr)
  );
};

/**
 * METHOD: Get user role in project
 */
projectSchema.methods.getUserRole = function(userId) {
  if (this.isOwner(userId)) return 'owner';
  if (this.isAdmin(userId)) return 'admin';
  if (this.isMember(userId)) return 'member';
  return null;
};

/**
 * METHOD: Check if user can manage project (owner or admin)
 */
projectSchema.methods.canManage = function(userId) {
  return this.isOwner(userId) || this.isAdmin(userId);
};

/**
 * PRE-SAVE MIDDLEWARE
 * Met à jour le compteur de membres actifs
 */
projectSchema.pre('save', function() {
  // On s'assure que admins et members sont des tableaux (sécurité)
  const admins = this.admins || [];
  const members = this.members || [];

  // Calcul du nombre de membres uniques
  const uniqueMembers = new Set([
    this.owner.toString(),
    ...this.admins.map(id => id.toString()),
    ...this.members.map(id => id.toString())
  ]);
  
  this.stats.activeMembers = uniqueMembers.size;
});

/**
 * PRE-REMOVE MIDDLEWARE
 * Clean up related data when project is deleted
 */
projectSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    console.log(`🧹 Nettoyage des données pour le projet: ${this._id}`);
    
    const Ticket = mongoose.model('Ticket');
    const Comment = mongoose.model('Comment');

    // 1. Trouver tous les tickets du projet
    const tickets = await Ticket.find({ projectId: this._id });
    const ticketIds = tickets.map(t => t._id);

    // 2. Supprimer les commentaires liés à ces tickets
    if (ticketIds.length > 0) {
      await Comment.deleteMany({ ticketId: { $in: ticketIds } });
    }

    // 3. Supprimer les tickets
    await Ticket.deleteMany({ projectId: this._id });

  } catch (error) {
    // Si c'est async, on lance l'erreur normalement pour que Mongoose la capture
    throw error;
  }
});

/**
 * CUSTOM JSON FORMAT
 * Hide sensitive data and add computed fields
 */
projectSchema.methods.toJSON = function() {
  const project = this.toObject({ virtuals: true });
  
  // Remove version key
  delete project.__v;
  
  return project;
};

module.exports = mongoose.model('Project', projectSchema);
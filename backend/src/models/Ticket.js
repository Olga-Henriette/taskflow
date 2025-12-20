const mongoose = require('mongoose');

/**
 * TICKET SCHEMA
 * Defines the structure of a ticket in MongoDB
 */
const ticketSchema = new mongoose.Schema({
  // Basic information
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
    default: ''
  },
  
  // Project association (required)
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Ticket must be associated with a project']
  },
  
  // Status management
  status: {
    type: String,
    enum: {
      values: ['todo', 'inprogress', 'review', 'done'],
      message: 'Status must be: todo, inprogress, review, or done'
    },
    default: 'todo'
  },
  
  // Priority
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be: low, medium, high, or urgent'
    },
    default: 'medium'
  },
  
  // Assignment
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ticket must have a creator']
  },
  
  // Dates
  estimatedDate: {
    type: Date,
    required: [true, 'Estimated completion date is required']
  },
  
  startedAt: Date,
  completedAt: Date,
  
  // Organization
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  position: {
    type: Number,
    default: 0 // For custom ordering in Kanban
  },
  
  // Attachments (Cloudinary URLs)
  attachments: [{
    url: String,
    publicId: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Counters (denormalized for performance)
  commentsCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

/**
 * INDEXES
 * Improve query performance
 */
ticketSchema.index({ projectId: 1, status: 1 });
ticketSchema.index({ assignees: 1 });
ticketSchema.index({ creator: 1 });
ticketSchema.index({ estimatedDate: 1 });
ticketSchema.index({ title: 'text', description: 'text' }); // Full-text search
ticketSchema.index({ projectId: 1, position: 1 }); // For Kanban ordering

/**
 * METHOD: Check if user is creator
 */
ticketSchema.methods.isCreator = function(userId) {
  return this.creator.toString() === userId.toString();
};

/**
 * METHOD: Check if user is assigned
 */
ticketSchema.methods.isAssigned = function(userId) {
  return this.assignees.some(
    assigneeId => assigneeId.toString() === userId.toString()
  );
};

/**
 * METHOD: Check if ticket is overdue
 */
ticketSchema.methods.isOverdue = function() {
  if (this.status === 'done') return false;
  return new Date() > this.estimatedDate;
};

/**
 * METHOD: Get days until deadline
 */
ticketSchema.methods.getDaysUntilDeadline = function() {
  const now = new Date();
  const diff = this.estimatedDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * PRE-SAVE MIDDLEWARE
 * Mise à jour des dates liées au statut
 */
ticketSchema.pre('save', async function() {
  // If status changed to 'inprogress' and startedAt is not set
  if (this.isModified('status')) {
    if (this.status === 'inprogress' && !this.startedAt) {
      this.startedAt = new Date();
    }
    
    // If status changed to 'done'
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    }
    
    // If status changed from 'done' to something else, clear completedAt
    if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
  
});

/**
 * PRE-DELETE MIDDLEWARE
 * Clean up related data when ticket is deleted
 */
ticketSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    // Delete all comments associated with this ticket if Comment model exists
    if (mongoose.models.Comment) {
      await mongoose.model('Comment').deleteMany({ ticketId: this._id });
    }
    
  } catch (error) {
    throw(error);
  }
});

/**
 * POST-SAVE MIDDLEWARE
 * Update project statistics
 */
ticketSchema.post('save', async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.projectId);
    
    if (project) {
      // Count total tickets
      const totalTickets = await mongoose.model('Ticket').countDocuments({
        projectId: this.projectId
      });
      
      // Count completed tickets
      const completedTickets = await mongoose.model('Ticket').countDocuments({
        projectId: this.projectId,
        status: 'done'
      });
      
      // Update project stats
      project.stats.totalTickets = totalTickets;
      project.stats.completedTickets = completedTickets;
      
      await project.save();
    }
  } catch (error) {
    console.error('Error updating project stats:', error);
  }
});

/**
 * POST-DELETE MIDDLEWARE
 * Update project statistics after deletion
 */
ticketSchema.post('deleteOne', { document: true, query: false }, async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.projectId);
    
    if (project) {
      // Recalculate stats
      const totalTickets = await mongoose.model('Ticket').countDocuments({
        projectId: this.projectId
      });
      
      const completedTickets = await mongoose.model('Ticket').countDocuments({
        projectId: this.projectId,
        status: 'done'
      });
      
      project.stats.totalTickets = totalTickets;
      project.stats.completedTickets = completedTickets;
      
      await project.save();
    }
  } catch (error) {
    console.error('Error updating project stats after deletion:', error);
  }
});

/**
 * CUSTOM JSON FORMAT
 */
ticketSchema.methods.toJSON = function() {
  const ticket = this.toObject();
  delete ticket.__v;
  return ticket;
};

module.exports = mongoose.model('Ticket', ticketSchema);
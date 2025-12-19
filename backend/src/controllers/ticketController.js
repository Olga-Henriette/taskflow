const Ticket = require('../models/Ticket');
const Project = require('../models/Project');

/**
 * @desc    Récupérer tous les tickets d'un projet
 * @route   GET /api/projects/:projectId/tickets
 * @access  Privé (Membres du projet)
 */
exports.getProjectTickets = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search, page = 1, limit = 50 } = req.query;
    
    // Vérifier l'existence du projet et l'accès utilisateur
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (!project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }
    
    // Build query
    const query = { projectId };
    
    // Filter by status
    if (status && ['todo', 'inprogress', 'review', 'done'].includes(status)) {
      query.status = status;
    }
    
    // Filter by priority
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }
    
    // Filter by assignee
    if (assignee) {
      query.assignees = assignee;
    }
    
    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const tickets = await Ticket.find(query)
      .populate('creator', 'firstName lastName email avatar')
      .populate('assignees', 'firstName lastName email avatar')
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Ticket.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private (Project members)
 */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check project access
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ticket'
      });
    }
    
    // Populate after verification
    await ticket.populate('creator', 'firstName lastName email avatar');
    await ticket.populate('assignees', 'firstName lastName email avatar');
    await ticket.populate('projectId', 'name');
    
    res.status(200).json({
      success: true,
      data: ticket
    });
    
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Create new ticket
 * @route   POST /api/projects/:projectId/tickets
 * @access  Private (Project members)
 */
exports.createTicket = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignees, estimatedDate, tags } = req.body;
    
    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (!project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to create tickets'
      });
    }
    
    // Validate assignees are project members
    if (assignees && assignees.length > 0) {
      const validAssignees = assignees.every(userId => 
        project.hasAccess(userId)
      );
      
      if (!validAssignees) {
        return res.status(400).json({
          success: false,
          message: 'All assignees must be project members'
        });
      }
    }
    
    // Create ticket
    const ticket = new Ticket({
      title,
      description,
      projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      assignees: assignees || [],
      creator: req.user._id,
      estimatedDate,
      tags: tags || []
    });
    
    await ticket.save();
    
    // Populate data
    await ticket.populate('creator', 'firstName lastName email avatar');
    await ticket.populate('assignees', 'firstName lastName email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });
    
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Update ticket
 * @route   PUT /api/tickets/:id
 * @access  Private (Project members)
 */
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check project access
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ticket'
      });
    }
    
    // Update allowed fields
    const { title, description, status, priority, assignees, estimatedDate, tags, position } = req.body;
    
    if (title) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (estimatedDate) ticket.estimatedDate = estimatedDate;
    if (tags) ticket.tags = tags;
    if (position !== undefined) ticket.position = position;
    
    // Validate and update assignees
    if (assignees) {
      const validAssignees = assignees.every(userId => 
        project.hasAccess(userId)
      );
      
      if (!validAssignees) {
        return res.status(400).json({
          success: false,
          message: 'All assignees must be project members'
        });
      }
      
      ticket.assignees = assignees;
    }
    
    await ticket.save();
    
    // Populate data
    await ticket.populate('creator', 'firstName lastName email avatar');
    await ticket.populate('assignees', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
    
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Delete ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private (Creator only)
 */
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Only creator can delete ticket
    if (!ticket.isCreator(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only ticket creator can delete this ticket'
      });
    }
    
    await ticket.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Assign users to ticket
 * @route   POST /api/tickets/:id/assign
 * @access  Private (Project members)
 */
exports.assignTicket = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check project access
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ticket'
      });
    }
    
    // Validate all users are project members
    const validUsers = userIds.every(userId => project.hasAccess(userId));
    
    if (!validUsers) {
      return res.status(400).json({
        success: false,
        message: 'All users must be project members'
      });
    }
    
    // Add users to assignees (avoid duplicates)
    userIds.forEach(userId => {
      if (!ticket.isAssigned(userId)) {
        ticket.assignees.push(userId);
      }
    });
    
    await ticket.save();
    await ticket.populate('assignees', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Users assigned successfully',
      data: ticket
    });
    
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Unassign user from ticket
 * @route   DELETE /api/tickets/:id/assign/:userId
 * @access  Private (Project members)
 */
exports.unassignTicket = async (req, res) => {
  try {
    const { userId } = req.params;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check project access
    const project = await Project.findById(ticket.projectId);
    
    if (!project || !project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ticket'
      });
    }
    
    // Remove user from assignees
    ticket.assignees = ticket.assignees.filter(
      assigneeId => assigneeId.toString() !== userId.toString()
    );
    
    await ticket.save();
    await ticket.populate('assignees', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'User unassigned successfully',
      data: ticket
    });
    
  } catch (error) {
    console.error('Error unassigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error unassigning ticket',
      error: error.message
    });
  }
};
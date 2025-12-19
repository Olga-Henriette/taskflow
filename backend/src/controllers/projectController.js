const Project = require('../models/Project');
const User = require('../models/User');

/**
 * @desc    Récupérer tous les projets de l'utilisateur authentifié
 * @route   GET /api/projects
 * @access  Privé
 */
exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search, page = 1, limit = 10 } = req.query;
    
    // Construction de la requête (Recherche où l'utilisateur est proprio, admin ou membre)
    const query = {
      $or: [
        { owner: userId },
        { admins: userId },
        { members: userId }
      ]
    };
    
    // Filtrage par statut
    if (status && ['active', 'inactive', 'archived'].includes(status)) {
      query.status = status;
    }
    
    // Recherche textuelle (nom ou description)
    if (search) {
      query.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Exécution de la requête avec population des données utilisateurs
    const projects = await Project.find(query)
      .populate('owner', 'firstName lastName email avatar')
      .populate('admins', 'firstName lastName email avatar')
      .populate('members', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Compte total pour la pagination côté front-end
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un projet spécifique par son ID
 * @route   GET /api/projects/:id
 * @access  Privé
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Vérifier si l'utilisateur a accès au projet
    if (!project.hasAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }
    
    // On peuple les données après la vérification de sécurité
    await project.populate('owner', 'firstName lastName email avatar');
    await project.populate('admins', 'firstName lastName email avatar');
    await project.populate('members', 'firstName lastName email avatar');
    
    // On ajoute le rôle spécifique de l'utilisateur dans la réponse
    const userRole = project.getUserRole(req.user._id);
    
    res.status(200).json({
      success: true,
      data: {
        ...project.toJSON(),
        userRole
      }
    });
    
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau projet
 * @route   POST /api/projects
 * @access  Privé
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, settings } = req.body;
    
    // Création du projet avec l'utilisateur actuel comme propriétaire (owner)
    const project = new Project({
      name,
      description,
      status: status || 'active',
      owner: req.user._id,
      settings: settings || {}
    });
    
    await project.save();
    
    // Populate owner info
    await project.populate('owner', 'firstName lastName email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un projet
 * @route   PUT /api/projects/:id
 * @access  Privé (Propriétaire ou Admin)
 */
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Vérification des droits de gestion (Owner ou Admin)
    if (!project.canManage(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admins can update this project'
      });
    }
    
    // Update allowed fields
    const { name, description, status, settings } = req.body;
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (settings) project.settings = { ...project.settings, ...settings };
    
    // Gestion de la date d'archivage
    if (status === 'archived' && !project.archivedAt) {
      project.archivedAt = new Date();
    } else if (status !== 'archived') {
      project.archivedAt = undefined;
    }
    
    await project.save();
    
    // Populate members
    await project.populate('owner admins members', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un projet
 * @route   DELETE /api/projects/:id
 * @access  Privé (Propriétaire uniquement)
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Seul le propriétaire peut supprimer le projet
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete this project'
      });
    }
    
    // Le deleteOne déclenchera le middleware pre('deleteOne') pour nettoyer tickets/commentaires
    await project.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

/**
 * @desc    Add admin to project
 * @route   POST /api/projects/:id/admins
 * @access  Private (Owner only)
 */
exports.addAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only owner can add admins
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can add admins'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is already admin
    if (project.isAdmin(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }
    
    // Add to admins
    project.admins.push(userId);
    
    // Remove from regular members if present
    project.members = project.members.filter(
      memberId => memberId.toString() !== userId.toString()
    );
    
    await project.save();
    await project.populate('owner admins members', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Admin added successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding admin',
      error: error.message
    });
  }
};

/**
 * @desc    Remove admin from project
 * @route   DELETE /api/projects/:id/admins/:userId
 * @access  Private (Owner only)
 */
exports.removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only owner can remove admins
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can remove admins'
      });
    }
    
    // Remove from admins
    project.admins = project.admins.filter(
      adminId => adminId.toString() !== userId.toString()
    );
    
    await project.save();
    await project.populate('owner admins members', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Admin removed successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing admin',
      error: error.message
    });
  }
};

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Owner or Admin)
 */
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only owner or admin can add members
    if (!project.canManage(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admins can add members'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is already a member
    if (project.isMember(userId) || project.isAdmin(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member or admin'
      });
    }
    
    // Add to members
    project.members.push(userId);
    await project.save();
    
    await project.populate('owner admins members', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member',
      error: error.message
    });
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Owner or Admin)
 */
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only owner or admin can remove members
    if (!project.canManage(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admins can remove members'
      });
    }
    
    // Cannot remove owner
    if (project.isOwner(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }
    
    // Remove from members
    project.members = project.members.filter(
      memberId => memberId.toString() !== userId.toString()
    );
    
    await project.save();
    await project.populate('owner admins members', 'firstName lastName email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: project
    });
    
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
};
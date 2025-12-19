const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * SCHÉMA UTILISATEUR
 * Définit la structure d'un utilisateur dans MongoDB
 */
const userSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true, // Enlève les espaces au début et à la fin
    minlength: [2, 'Le prénom doit avoir au moins 2 caractères'],
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  
  lastName: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    minlength: [2, 'Le nom doit avoir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true, // Pas de doublons
    lowercase: true, // Convertit en minuscules
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Email invalide'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    trim: true
  },
  
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [8, 'Le mot de passe doit avoir au moins 8 caractères'],
    select: false // Par défaut, ne retourne pas le password dans les requêtes
  },
  
  avatar: {
    type: String,
    default: null // URL de l'image Cloudinary 
  },
  
  // Préférences utilisateur
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'fr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Réinitialisation de mot de passe
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Métadonnées
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date

}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

/**
 * MIDDLEWARE PRÉ-SAUVEGARDE
 * Hash le mot de passe avant de sauvegarder dans la base
 */
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * MÉTHODE : Comparer les mots de passe
 * Utilisée lors de la connexion pour vérifier le password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * MÉTHODE : Obtenir le nom complet
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * MÉTHODE : Format JSON pour les réponses (cache les données sensibles)
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Supprime les champs sensibles
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.__v;
  
  return user;
};

// Index pour améliorer les performances de recherche
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Exporter le modèle
module.exports = mongoose.model('User', userSchema);
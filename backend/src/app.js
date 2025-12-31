const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

/**
 * MIDDLEWARES GLOBAUX
 * Ce sont des fonctions qui s'exécutent avant chaque requête
 */

// 1. CORS - Permet au frontend de communiquer avec le backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Permet d'envoyer des cookies
}));

// 2. Parser JSON - Permet de lire les données JSON envoyées par le client
app.use(express.json());

app.use('/api/users', userRoutes);

// 3. Parser URL-encoded - Permet de lire les données de formulaires
app.use(express.urlencoded({ extended: true }));

// 4. Logger simple pour le développement
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Passe à la prochaine fonction
});

/**
 * ROUTES
 */

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API TaskFlow fonctionne!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route de health check (pour vérifier que tout va bien)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'connected',
    uptime: process.uptime()
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des projets
app.use('/api/projects', projectRoutes);

// Routes des tickets
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);

/**
 * GESTION DES ERREURS
 */

// Route 404 - Si aucune route ne correspond
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('❌ Erreur:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    // Affiche la stack trace seulement en développement
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
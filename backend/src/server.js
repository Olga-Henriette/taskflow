const app = require('./app');
const connectDB = require('./config/database');

// Configuration du port
const PORT = process.env.PORT || 5000;

/**
 * DÉMARRAGE DU SERVEUR
 * On connecte d'abord à MongoDB, puis on lance le serveur Express
 */

const startServer = async () => {
  try {
    // 1. Connexion à MongoDB
    await connectDB();
    
    // 2. Démarrage du serveur Express
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🚀  Serveur TaskFlow démarré !`);
      console.log(`🚀  Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀  Port: ${PORT}`);
      console.log(`🚀  URL: http://localhost:${PORT}`);
      console.log('🚀 ========================================');
      console.log('');
      console.log('📌 Routes disponibles:');
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('💡 Appuie sur CTRL+C pour arrêter le serveur');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();
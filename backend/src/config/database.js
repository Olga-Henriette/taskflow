const mongoose = require('mongoose');

/**
 * Connexion à MongoDB Atlas
 * Cette fonction établit la connexion à la base de données
 */
const connectDB = async () => {
  try {
    // Tentative de connexion
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB connecté avec succès: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // Quitter l'application si la connexion échoue
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB déconnecté');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur MongoDB:', error);
});

module.exports = connectDB;
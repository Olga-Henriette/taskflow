import axios from './axios';

/**
 * SERVICE D'AUTHENTIFICATION
 * Toutes les fonctions pour gérer l'authentification
 */

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  
  // Sauvegarder les tokens et l'utilisateur
  if (response.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Connexion utilisateur
 */
export const login = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  
  // Sauvegarder les tokens et l'utilisateur
  if (response.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Déconnexion utilisateur
 */
export const logout = async () => {
  try {
    await axios.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Toujours nettoyer le localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

/**
 * Récupérer le profil utilisateur connecté
 */
export const getMe = async () => {
  const response = await axios.get('/auth/me');
  
  // Mettre à jour les données utilisateur dans localStorage
  if (response.success) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response;
};

/**
 * Rafraîchir le token d'accès
 */
export const refreshToken = async (refreshToken) => {
  const response = await axios.post('/auth/refresh', { refreshToken });
  return response;
};
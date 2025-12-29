import axios from './axios';

/**
 * SERVICE DES PROJETS
 * Toutes les fonctions pour gérer les projets
 */

/**
 * Récupérer tous les projets de l'utilisateur
 */
export const getProjects = async (params = {}) => {
  const response = await axios.get('/projects', { params });
  return response;
};

/**
 * Récupérer un projet par son ID
 */
export const getProjectById = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}`);
  return response;
};

/**
 * Créer un nouveau projet
 */
export const createProject = async (projectData) => {
  const response = await axios.post('/projects', projectData);
  return response;
};

/**
 * Mettre à jour un projet
 */
export const updateProject = async (projectId, projectData) => {
  const response = await axios.put(`/projects/${projectId}`, projectData);
  return response;
};

/**
 * Supprimer un projet
 */
export const deleteProject = async (projectId) => {
  const response = await axios.delete(`/projects/${projectId}`);
  return response;
};

/**
 * Ajouter un membre au projet
 */
export const addMember = async (projectId, userId) => {
  const response = await axios.post(`/projects/${projectId}/members`, { userId });
  return response;
};

/**
 * Retirer un membre du projet
 */
export const removeMember = async (projectId, userId) => {
  const response = await axios.delete(`/projects/${projectId}/members/${userId}`);
  return response;
};

/**
 * Ajouter un admin au projet
 */
export const addAdmin = async (projectId, userId) => {
  const response = await axios.post(`/projects/${projectId}/admins`, { userId });
  return response;
};

/**
 * Retirer un admin du projet
 */
export const removeAdmin = async (projectId, userId) => {
  const response = await axios.delete(`/projects/${projectId}/admins/${userId}`);
  return response;
};
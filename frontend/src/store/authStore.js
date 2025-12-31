import { create } from 'zustand';
import * as authApi from '../api/authApi';

/**
 * Gère l'état global de l'authentification avec Zustand
 */
const useAuthStore = create((set) => ({
  // État initial
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  
  /**
   * Inscription
   */
  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register(userData);
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Connexion
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true};
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Déconnexion
   */
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  /**
   * Récupérer le profil utilisateur
   */
  fetchUser: async () => {
    set({ isLoading: true });
    
    try {
      const response = await authApi.getMe();
      
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Mettre à jour l'utilisateur localement
   */
  updateUser: (userData) => {
    set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  /**
   * Réinitialiser l'erreur
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
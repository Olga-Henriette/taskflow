import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Logo from '../components/common/Logo';
import useToast from '../hooks/useToast';

/**
 * SCHÉMA DE VALIDATION
 * Valide les données du formulaire avec Zod
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est obligatoire')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire'),
});

/**
 * PAGE DE CONNEXION
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const toast = useToast();
  
  // Configuration du formulaire avec React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  /**
   * Soumission du formulaire
   */
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await login(data);
    
    if (result.success) {
      toast.success('Connexion réussie ! Bienvenue 👋');
      navigate('/dashboard');
    } else {
      // Afficher l'erreur
      setServerError(result.error);
      toast.error(result.error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bon retour !
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous pour accéder à vos projets
          </p>
        </div>
        
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {serverError}
            </p>
          </div>
        )}
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Se connecter
          </Button>
        </form>
        
        {/* Lien vers inscription */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="text-primary-500 hover:text-primary-600 font-medium hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
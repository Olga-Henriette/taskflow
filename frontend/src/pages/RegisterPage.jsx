import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Logo from '../components/common/Logo';

/**
 * SCHÉMA DE VALIDATION
 * Valide les données du formulaire avec Zod
 */
const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit avoir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit avoir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est obligatoire')
    .email('Email invalide'),
  phone: z
    .string()
    .min(8, 'Le numéro de téléphone doit avoir au moins 8 caractères')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Numéro de téléphone invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit avoir au moins 8 caractères')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule'),
  confirmPassword: z
    .string()
    .min(1, 'Veuillez confirmer votre mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * PAGE D'INSCRIPTION
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const toast = useToast();
  
  // Configuration du formulaire avec React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  
  /**
   * Soumission du formulaire
   */
  const onSubmit = async (data) => {
    setServerError('');
    
    // Retirer confirmPassword avant d'envoyer
    const { confirmPassword, ...userData } = data;
    
    const result = await registerUser(userData);
    
    if (result.success) {
      toast.success('Compte créé avec succès ! 🎉');
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
            Créer un compte
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Commencez à gérer vos projets dès maintenant
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Prénom"
            type="text"
            placeholder="Jean"
            icon={User}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          
          <Input
            label="Nom"
            type="text"
            placeholder="Dupont"
            icon={User}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="jean.dupont@email.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+261 34 12 345 67"
            icon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />
          
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          
          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          
          {/* Bouton d'inscription */}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6"
            isLoading={isLoading}
          >
            Créer mon compte
          </Button>
        </form>
        
        {/* Lien vers connexion */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="text-primary-500 hover:text-primary-600 font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
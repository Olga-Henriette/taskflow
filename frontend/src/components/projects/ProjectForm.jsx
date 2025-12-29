import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * SCHÉMA DE VALIDATION
 */
const projectSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit avoir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  status: z
    .enum(['active', 'inactive', 'archived'])
    .default('active'),
});

/**
 * Formulaire pour créer/modifier un projet
 */
const ProjectForm = ({ 
  onSubmit, 
  onCancel, 
  defaultValues = {}, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues.name || '',
      description: defaultValues.description || '',
      status: defaultValues.status || 'active',
    },
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nom du projet"
        placeholder="Ex: Refonte site web"
        error={errors.name?.message}
        {...register('name')}
      />
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          placeholder="Décrivez votre projet..."
          rows={4}
          className={`
            w-full px-4 py-2 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            dark:bg-gray-800 dark:text-white
            ${errors.description 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
            }
          `}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>
      
      {/* Statut */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Statut
        </label>
        <select
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     dark:bg-gray-800 dark:text-white transition-all duration-200"
          {...register('status')}
        >
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="archived">Archivé</option>
        </select>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {defaultValues._id ? 'Mettre à jour' : 'Créer le projet'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
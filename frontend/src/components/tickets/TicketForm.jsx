import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * SCHÉMA DE VALIDATION
 */
const ticketSchema = z.object({
  title: z
    .string()
    .min(3, 'Le titre doit avoir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .max(5000, 'La description ne peut pas dépasser 5000 caractères')
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  status: z
    .enum(['todo', 'inprogress', 'review', 'done'])
    .default('todo'),
  estimatedDate: z
    .string()
    .min(1, 'La date d\'estimation est obligatoire'),
  tags: z
    .string()
    .optional(),
});

/**
 * Formulaire pour créer/modifier un ticket
 */
const TicketForm = ({ 
  onSubmit, 
  onCancel, 
  defaultValues = {}, 
  isLoading = false,
  projectMembers = []
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: defaultValues.title || '',
      description: defaultValues.description || '',
      priority: defaultValues.priority || 'medium',
      status: defaultValues.status || 'todo',
      estimatedDate: defaultValues.estimatedDate 
        ? new Date(defaultValues.estimatedDate).toISOString().split('T')[0]
        : '',
      tags: defaultValues.tags?.join(', ') || '',
    },
  });
  
  /**
   * Traiter la soumission
   */
  const handleFormSubmit = (data) => {
    // Convertir les tags en tableau
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
    
    onSubmit({
      ...data,
      tags,
      // Convertir la date en ISO
      estimatedDate: new Date(data.estimatedDate).toISOString(),
    });
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Titre */}
      <Input
        label="Titre du ticket"
        placeholder="Ex: Corriger le bug de connexion"
        error={errors.title?.message}
        {...register('title')}
      />
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          placeholder="Décrivez le ticket en détail..."
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
      
      {/* Grille : Priorité + Statut */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priorité
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       dark:bg-gray-800 dark:text-white transition-all duration-200"
            {...register('priority')}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
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
            <option value="todo">À faire</option>
            <option value="inprogress">En cours</option>
            <option value="review">En validation</option>
            <option value="done">Terminé</option>
          </select>
        </div>
      </div>
      
      <Input
        label="Date d'estimation"
        type="date"
        error={errors.estimatedDate?.message}
        {...register('estimatedDate')}
      />
      
      <Input
        label="Tags (séparés par des virgules)"
        placeholder="bug, urgent, frontend"
        error={errors.tags?.message}
        {...register('tags')}
      />
      
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
          {defaultValues._id ? 'Mettre à jour' : 'Créer le ticket'}
        </Button>
      </div>
    </form>
  );
};

export default TicketForm;
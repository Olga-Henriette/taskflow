import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectApi from '../api/projectApi';
import { User } from 'lucide-react';

/**
 * Vue d'ensemble et accès rapide
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Mutation pour créer un projet
  const createMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setIsCreateModalOpen(false);
      navigate('/projects');
    },
  });
  
  const handleCreateProject = (data) => {
    createMutation.mutate(data);
  };
  
  return (
    <MainLayout onCreateProject={() => setIsCreateModalOpen(true)}>
      <Card className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
          <User className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue, {user?.firstName} ! 🎉
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Commencez à gérer vos projets efficacement avec TaskFlow
        </p>
        
        <div className="space-y-2 text-sm text-left max-w-md mx-auto">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Téléphone:</strong> {user?.phone}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Compte créé:</strong> {new Date(user?.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </Card>
      
      {/* Modal Créer Projet */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer un nouveau projet"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </MainLayout>
  );
};

export default DashboardPage;
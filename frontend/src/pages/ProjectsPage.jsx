import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Users, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import * as projectApi from '../api/projectApi';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Liste tous les projets de l'utilisateur
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Récupérer les projets
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
  });
  
  const projects = projectsData?.data || [];
  
  // Mutation pour créer un projet
  const createMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setIsCreateModalOpen(false);
    },
  });
  
  // Mutation pour supprimer un projet
  const deleteMutation = useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });
  
  /**
   * Gérer la création d'un projet
   */
  const handleCreateProject = (data) => {
    createMutation.mutate(data);
  };
  
  /**
   * Gérer la suppression d'un projet
   */
  const handleDeleteProject = (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteMutation.mutate(projectId);
    }
  };
  
  /**
   * Obtenir le badge de statut
   */
  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      archived: 'Archivé',
    };
    
    return (
      <span className={`badge ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };
  
  return (
    <MainLayout onCreateProject={() => setIsCreateModalOpen(true)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mes Projets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez tous vos projets en un seul endroit
        </p>
      </div>
      
      {/* Liste des projets */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun projet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par créer votre premier projet
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Créer un projet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project._id} 
              className="p-6 hover cursor-pointer group"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              {/* Header avec statut */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                    {project.name}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>
                
                {/* Menu actions */}
                {project.userRole === 'owner' && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle menu
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description || 'Aucune description'}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.stats.activeMembers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderKanban className="w-4 h-4" />
                  <span>{project.stats.totalTickets}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(project.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
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

export default ProjectsPage;
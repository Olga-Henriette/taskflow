import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Settings, Plus } from 'lucide-react';
import * as projectApi from '../api/projectApi';
import * as ticketApi from '../api/ticketApi';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import KanbanBoard from '../components/tickets/KanbanBoard';
import TicketForm from '../components/tickets/TicketForm';
import TicketDetailModal from '../components/tickets/TicketDetailModal';

/**
 * Affiche les détails d'un projet et ses tickets en vue Kanban
 */
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Récupérer le projet
  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId),
  });
  
  const project = projectData?.data;
  
  // Récupérer les tickets du projet
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['tickets', projectId],
    queryFn: () => ticketApi.getProjectTickets(projectId),
    enabled: !!projectId,
  });
  
  const tickets = ticketsData?.data || [];
  
  const createTicketMutation = useMutation({
    mutationFn: (data) => ticketApi.createTicket(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets', projectId]);
      queryClient.invalidateQueries(['project', projectId]);
      setIsCreateTicketModalOpen(false);
    },
  });
  
  // Mutation pour mettre à jour le statut d'un ticket (drag & drop)
  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }) => ticketApi.updateTicket(ticketId, { status }),
    onMutate: async ({ ticketId, status }) => {
      // Annuler les refetch en cours
      await queryClient.cancelQueries(['tickets', projectId]);
      
      // Sauvegarder l'état précédent
      const previousTickets = queryClient.getQueryData(['tickets', projectId]);
      
      // Mettre à jour optimistiquement (instantané)
      queryClient.setQueryData(['tickets', projectId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(ticket =>
            ticket._id === ticketId ? { ...ticket, status } : ticket
          )
        };
      });
      
      return { previousTickets };
    },
    onError: (err, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets', projectId], context.previousTickets);
      }
    },
    onSettled: () => {
      // Refetch silencieusement en arrière-plan
      queryClient.invalidateQueries(['tickets', projectId]);
    },
  });
    
  const handleCreateTicket = (data) => {
    createTicketMutation.mutate(data);
  };
  
  /**
   * Gérer le changement de statut d'un ticket (drag & drop)
   */
  const handleStatusChange = (ticketId, newStatus) => {
    updateTicketStatusMutation.mutate({ ticketId, status: newStatus });
  };
  
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };
  
  /**
   * Obtenir le badge de statut du projet
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
  
  if (isLoadingProject) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Projet non trouvé</p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            Retour aux projets
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      {/* En-tête du projet */}
      <div className="mb-6">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </button>
        
        {/* Titre et actions */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description || 'Aucune description'}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{project.stats.activeMembers} membres</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {project.stats.completedTickets}
                </span>
                /{project.stats.totalTickets} tickets terminés
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
            >
              <Users className="w-4 h-4 mr-2" />
              Membres
            </Button>
            
            {(project.userRole === 'owner' || project.userRole === 'admin') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateTicketModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau ticket
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tableau Kanban */}
      {isLoadingTickets ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Chargement des tickets...</p>
        </div>
      ) : (
        <KanbanBoard
          tickets={tickets}
          onTicketClick={handleTicketClick}
          onCreateTicket={() => setIsCreateTicketModalOpen(true)}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Modal Créer Ticket */}
      <Modal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        title="Créer un nouveau ticket"
        size="lg"
      >
        <TicketForm
          onSubmit={handleCreateTicket}
          onCancel={() => setIsCreateTicketModalOpen(false)}
          isLoading={createTicketMutation.isPending}
          projectMembers={[
            project.owner,
            ...(project.admins || []),
            ...(project.members || [])
          ]}
        />
      </Modal>
      
      {/* Modal Détails Ticket */}
      <TicketDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        projectId={projectId}
      />
    </MainLayout>
  );
};

export default ProjectDetailPage;
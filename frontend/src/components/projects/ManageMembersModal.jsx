import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Crown, Shield } from 'lucide-react';
import * as projectApi from '../../api/projectApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';
import * as userApi from '../../api/userApi';

/**
 * Modal pour gérer les membres d'un projet
 */
const ManageMembersModal = ({ isOpen, onClose, project }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuthStore();
  const [emailToAdd, setEmailToAdd] = useState('');
  
  // Mutation pour ajouter un membre
  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }) => projectApi.addMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project._id]);
      toast.success('Membre ajouté avec succès !');
      setEmailToAdd('');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du membre');
    },
  });
  
  // Mutation pour retirer un membre
  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project._id]);
      toast.success('Membre retiré avec succès !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors du retrait du membre');
    },
  });
  
  // Mutation pour ajouter un admin
  const addAdminMutation = useMutation({
    mutationFn: ({ projectId, userId }) => projectApi.addAdmin(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project._id]);
      toast.success('Admin ajouté avec succès !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'admin');
    },
  });
  
  // Mutation pour retirer un admin
  const removeAdminMutation = useMutation({
    mutationFn: ({ projectId, userId }) => projectApi.removeAdmin(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project._id]);
      toast.success('Admin retiré avec succès !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors du retrait de l\'admin');
    },
  });
  
  if (!project) return null;
  
  /**
   * Gérer l'ajout d'un membre (placeholder - nécessite recherche d'utilisateur)
   */
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!emailToAdd.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }
    
    try {
      // Rechercher l'utilisateur
      const result = await userApi.searchUserByEmail(emailToAdd);
      const foundUser = result.data;
      
      // Vérifier s'il n'est pas déjà membre
      const isAlreadyMember = allMembers.some(m => m._id === foundUser._id);
      
      if (isAlreadyMember) {
        toast.error('Cet utilisateur est déjà membre du projet');
        return;
      }
      
      // Ajouter le membre
      addMemberMutation.mutate({ projectId: project._id, userId: foundUser._id });
      
    } catch (error) {
      toast.error(error.message || 'Utilisateur non trouvé');
    }
  };
  
  /**
   * Obtenir tous les membres
   */
  const allMembers = [
    { ...project.owner, role: 'owner' },
    ...(project.admins || []).map(admin => ({ ...admin, role: 'admin' })),
    ...(project.members || []).map(member => ({ ...member, role: 'member' })),
  ];
  
  /**
   * Vérifier si l'utilisateur peut gérer les membres
   */
  const canManage = project.userRole === 'owner' || project.userRole === 'admin';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les membres" size="md">
      <div className="space-y-6">
        {/* Formulaire d'ajout (placeholder) */}
        {canManage && (
          <form onSubmit={handleAddMember} className="space-y-3">
            <Input
              label="Ajouter un membre"
              type="email"
              placeholder="email@exemple.com"
              value={emailToAdd}
              onChange={(e) => setEmailToAdd(e.target.value)}
              icon={UserPlus}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full"
            >
              Ajouter un membre
            </Button>
          </form>
        )}
        
        {/* Liste des membres */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Membres du projet ({allMembers.length})
          </h3>
          
          <div className="space-y-2">
            {allMembers.map((member) => {
              const isCurrentUser = member._id === user._id;
              const isOwner = member.role === 'owner';
              const isAdmin = member.role === 'admin';
              
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                    </div>
                    
                    {/* Infos */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.firstName} {member.lastName}
                          {isCurrentUser && ' (vous)'}
                        </p>
                        
                        {/* Badge rôle */}
                        {isOwner && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                            <Crown className="w-3 h-3" />
                            Propriétaire
                          </span>
                        )}
                        {isAdmin && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {canManage && !isOwner && !isCurrentUser && (
                    <div className="flex items-center gap-2">
                      {/* Promouvoir/Rétrograder admin */}
                      {project.userRole === 'owner' && (
                        <button
                          onClick={() => {
                            if (isAdmin) {
                              removeAdminMutation.mutate({ projectId: project._id, userId: member._id });
                            } else {
                              addAdminMutation.mutate({ projectId: project._id, userId: member._id });
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={isAdmin ? 'Retirer admin' : 'Promouvoir admin'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Retirer */}
                      <button
                        onClick={() => removeMemberMutation.mutate({ projectId: project._id, userId: member._id })}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Retirer du projet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManageMembersModal;
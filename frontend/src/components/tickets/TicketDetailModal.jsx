import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Tag, Users, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as ticketApi from '../../api/ticketApi';
import * as commentApi from '../../api/commentApi';
import useToast from '../../hooks/useToast';
import Button from '../common/Button';
import Modal from '../common/Modal';
import TicketForm from './TicketForm';

/**
 * Modal avec tous les détails d'un ticket + commentaires
 */
const TicketDetailModal = ({ isOpen, onClose, ticket, projectId }) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [newComment, setNewComment] = useState('');
  const toast = useToast();
  
  // Récupérer les commentaires du ticket
  const { data: commentsData } = useQuery({
    queryKey: ['comments', ticket?._id],
    queryFn: () => commentApi.getTicketComments(ticket._id),
    enabled: !!ticket && isOpen,
  });
  
  const comments = commentsData?.data || [];
  
  // Mutation pour mettre à jour le ticket
  const updateMutation = useMutation({
    mutationFn: (data) => ticketApi.updateTicket(ticket._id, data),
    onSuccess: (updatedTicket) => {
      toast.success('Ticket mis à jour !');
      queryClient.invalidateQueries(['tickets', projectId]);
      queryClient.setQueryData(['ticket', ticket._id], updatedTicket.data);
      setIsEditMode(false);
    },
    onError: (error) => {
      alert("Erreur lors de la modification : " + error.message);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: () => ticketApi.deleteTicket(ticket._id),
    onSuccess: () => {
      toast.success('Ticket supprimé !');
      queryClient.invalidateQueries(['tickets', projectId]);
      onClose();
    },
  });
  
  // Mutation pour créer un commentaire
  const createCommentMutation = useMutation({
    mutationFn: (content) => commentApi.createComment(ticket._id, content),
    onMutate: async (content) => {
      // Annuler refetch en cours
      await queryClient.cancelQueries(['comments', ticket._id]);
      
      // Snapshot de l'état précédent
      const previousComments = queryClient.getQueryData(['comments', ticket._id]);
      
      // Mise à jour optimiste
      queryClient.setQueryData(['comments', ticket._id], (old) => {
        const newComment = {
          _id: 'temp-' + Date.now(),
          content,
          author: JSON.parse(localStorage.getItem('user')),
          createdAt: new Date().toISOString(),
          isEdited: false,
        };
        return {
          ...old,
          data: [...(old?.data || []), newComment]
        };
      });
      
      setNewComment('');
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', ticket._id], context.previousComments);
      }
      alert(err.message || "Impossible d'ajouter le commentaire");
    },
    onSettled: () => {
      toast.success('Commentaire ajouté !')
      queryClient.invalidateQueries(['comments', ticket._id]);
    },
  });
  
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      toast.success('Commentaire supprimé !');
      queryClient.invalidateQueries(['comments', ticket._id]);
      queryClient.invalidateQueries(['tickets', projectId]);
    },
  });
  
  if (!ticket) return null;
  
  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };
  
  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      deleteMutation.mutate();
    }
  };
  
  const handleAddComment = (e) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (trimmedComment) {
        createCommentMutation.mutate(trimmedComment);
    }
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    };
    return colors[priority] || colors.medium;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      todo: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
      inprogress: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      review: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      done: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    };
    return colors[status] || colors.todo;
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      {isEditMode ? (
        /* Mode édition */
        <TicketForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditMode(false)}
          defaultValues={ticket}
          isLoading={updateMutation.isPending}
        />
      ) : (
        /* Mode lecture */
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {ticket.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority === 'low' && 'Faible'}
                  {ticket.priority === 'medium' && 'Moyenne'}
                  {ticket.priority === 'high' && 'Haute'}
                  {ticket.priority === 'urgent' && 'Urgente'}
                </span>
                <span className={`badge ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'todo' && 'À faire'}
                  {ticket.status === 'inprogress' && 'En cours'}
                  {ticket.status === 'review' && 'En validation'}
                  {ticket.status === 'done' && 'Terminé'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {/* Description */}
          {ticket.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}
          
          {/* Métadonnées */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date d'échéance */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Date d'échéance</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {format(new Date(ticket.estimatedDate), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            
            {/* Créateur */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-medium">Créé par</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {ticket.creator?.firstName} {ticket.creator?.lastName}
              </p>
            </div>
          </div>
          
          {/* Assignés */}
          {ticket.assignees && ticket.assignees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Assignés</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticket.assignees.map((assignee) => (
                  <div
                    key={assignee._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                      {assignee.firstName?.charAt(0)}{assignee.lastName?.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {assignee.firstName} {assignee.lastName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Commentaires */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Commentaires ({comments.length})
              </h3>
            </div>
            
            {/* Formulaire nouveau commentaire */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        dark:bg-gray-800 dark:text-white transition-all duration-200"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={createCommentMutation.isPending}
                  disabled={!newComment.trim()}
                >
                  Commenter
                </Button>
              </div>
            </form>
            
            {/* Liste des commentaires */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucun commentaire pour le moment
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {comment.author?.firstName?.charAt(0)}{comment.author?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(comment.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                            {comment.isEdited && ' (modifié)'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TicketDetailModal;
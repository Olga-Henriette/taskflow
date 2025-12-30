import React from 'react';
import { Calendar, MessageCircle, Paperclip, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Carte d'affichage d'un ticket dans le Kanban
 */
const TicketCard = ({ ticket, onClick }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    };
    return colors[priority] || colors.medium;
  };
  
  /**
   * Vérifier si le ticket est en retard
   */
  const isOverdue = () => {
    if (ticket.status === 'done') return false;
    return new Date() > new Date(ticket.estimatedDate);
  };
  
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 
                 hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* En-tête : Priorité + Tags */}
      <div className="flex items-start justify-between mb-3">
        {/* Priorité */}
        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority === 'low' && 'Faible'}
          {ticket.priority === 'medium' && 'Moyenne'}
          {ticket.priority === 'high' && 'Haute'}
          {ticket.priority === 'urgent' && 'Urgente'}
        </span>
        
        {/* Indicateur de retard */}
        {isOverdue() && (
          <AlertCircle className="w-4 h-4 text-red-500" title="En retard" />
        )}
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
        {ticket.title}
      </h4>
      
      {/* Description (si présente) */}
      {ticket.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {ticket.description}
        </p>
      )}
      
      {/* Tags */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
          {ticket.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{ticket.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Footer : Assignés + Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Utilisateurs assignés */}
        <div className="flex -space-x-2">
          {ticket.assignees && ticket.assignees.length > 0 ? (
            <>
              {ticket.assignees.slice(0, 3).map((assignee) => (
                <div
                  key={assignee._id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 
                             flex items-center justify-center text-white text-xs font-medium 
                             border-2 border-white dark:border-gray-800"
                  title={`${assignee.firstName} ${assignee.lastName}`}
                >
                  {assignee.avatar ? (
                    <img src={assignee.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    `${assignee.firstName?.charAt(0)}${assignee.lastName?.charAt(0)}`
                  )}
                </div>
              ))}
              {ticket.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                  +{ticket.assignees.length - 3}
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">Non assigné</span>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {/* Date d'échéance */}
          <div className="flex items-center gap-1" title="Date d'échéance">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(ticket.estimatedDate), 'dd MMM', { locale: fr })}</span>
          </div>
          
          {/* Nombre de commentaires */}
          {ticket.commentsCount > 0 && (
            <div className="flex items-center gap-1" title="Commentaires">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{ticket.commentsCount}</span>
            </div>
          )}
          
          {/* Nombre de pièces jointes */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1" title="Pièces jointes">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{ticket.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
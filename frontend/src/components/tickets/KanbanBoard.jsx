import React from 'react';
import { Plus } from 'lucide-react';
import TicketCard from './TicketCard';

/**
 * Tableau Kanban avec colonnes de statuts
 */
const KanbanBoard = ({ tickets = [], onTicketClick, onCreateTicket }) => {
  const columns = [
    {
      id: 'todo',
      title: 'À faire',
      color: 'bg-gray-500',
    },
    {
      id: 'inprogress',
      title: 'En cours',
      color: 'bg-blue-500',
    },
    {
      id: 'review',
      title: 'En validation',
      color: 'bg-yellow-500',
    },
    {
      id: 'done',
      title: 'Terminé',
      color: 'bg-green-500',
    },
  ];
  
  /**
   * Grouper les tickets par statut
   */
  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {columns.map((column) => {
        const columnTickets = getTicketsByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            {/* En-tête de colonne */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {columnTickets.length}
                </span>
              </div>
              
              {/* Bouton ajouter ticket */}
              {column.id === 'todo' && (
                <button
                  onClick={() => onCreateTicket(column.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm 
                           bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                           text-gray-600 dark:text-gray-300"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un ticket
                </button>
              )}
            </div>
            
            {/* Liste des tickets */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {columnTickets.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  Aucun ticket
                </p>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={() => onTicketClick(ticket)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
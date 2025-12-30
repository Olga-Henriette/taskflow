import React from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TicketCard from './TicketCard';

/**
 * Ticket avec capacité de drag & drop
 */
const SortableTicketCard = ({ ticket, onTicketClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} onClick={() => onTicketClick(ticket)} />
    </div>
  );
};

/**
 * Colonne qui peut recevoir des tickets
 */
const DroppableColumn = ({ column, tickets, onTicketClick, onCreateTicket }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[500px]"
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
            {tickets.length}
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

      {/* Zone de drop - Liste des tickets */}
      <SortableContext
        items={tickets.map(t => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {tickets.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              Glissez un ticket ici
            </div>
          ) : (
            tickets.map((ticket) => (
              <SortableTicketCard
                key={ticket._id}
                ticket={ticket}
                onTicketClick={onTicketClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

/**
 * Tableau Kanban avec drag & drop entre colonnes
 */
const KanbanBoard = ({ tickets = [], onTicketClick, onCreateTicket, onStatusChange }) => {
  const [activeId, setActiveId] = React.useState(null);

  // Configuration des sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Configuration des colonnes
  const columns = [
    { id: 'todo', title: 'À faire', color: 'bg-gray-500' },
    { id: 'inprogress', title: 'En cours', color: 'bg-blue-500' },
    { id: 'review', title: 'En validation', color: 'bg-yellow-500' },
    { id: 'done', title: 'Terminé', color: 'bg-green-500' },
  ];

  /**
   * Grouper les tickets par statut
   */
  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  /**
   * Gérer le début du drag
   */
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  /**
   * Gérer le drop (changement de statut)
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTicket = tickets.find(t => t._id === active.id);
    
    // Si on drop sur une colonne
    if (activeTicket && columns.some(col => col.id === over.id)) {
      if (activeTicket.status !== over.id) {
        onStatusChange(activeTicket._id, over.id);
      }
    }
    
    // Si on drop sur un autre ticket (dans sa colonne)
    if (activeTicket && tickets.some(t => t._id === over.id)) {
      const overTicket = tickets.find(t => t._id === over.id);
      if (activeTicket.status !== overTicket.status) {
        onStatusChange(activeTicket._id, overTicket.status);
      }
    }

    setActiveId(null);
  };

  // Trouver le ticket actif pour le DragOverlay
  const activeTicket = activeId ? tickets.find(t => t._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tickets={getTicketsByStatus(column.id)}
            onTicketClick={onTicketClick}
            onCreateTicket={onCreateTicket}
          />
        ))}
      </div>

      {/* Overlay pendant le drag */}
      <DragOverlay>
        {activeTicket ? (
          <div className="rotate-3 scale-105 opacity-90">
            <TicketCard ticket={activeTicket} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
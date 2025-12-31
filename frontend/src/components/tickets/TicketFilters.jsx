import React from 'react';
import { Search, Filter, X } from 'lucide-react';

/**
 * Barre de recherche et filtres pour les tickets
 */
const TicketFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = filters.search || filters.priority || filters.assignee;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Recherche */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Filtre Priorité */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        
        {/* Bouton Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>
      
      {/* Indicateur de résultats */}
      {hasActiveFilters && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Filtres actifs
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, Settings, Plus } from 'lucide-react';

/**
 * Barre latérale de navigation
 */
const Sidebar = ({ onCreateProject }) => {
  const navLinks = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/projects',
      icon: FolderKanban,
      label: 'Projets',
    },
    {
      to: '/team',
      icon: Users,
      label: 'Équipe',
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Paramètres',
    },
  ];
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-6">
        <button
          onClick={onCreateProject}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau projet
        </button>
        
        {/* Navigation */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Section Projets récents (placeholder) */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Projets récents
          </h3>
          <div className="space-y-1">
            <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Aucun projet récent
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
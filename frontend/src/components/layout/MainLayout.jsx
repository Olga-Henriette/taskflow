import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout principal avec Navbar et Sidebar
 */
const MainLayout = ({ children, onCreateProject }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar />
      
      {/* Container principal */}
      <div className="flex">
        <Sidebar onCreateProject={onCreateProject} />
        
        {/* Contenu principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
import React from 'react';

/**
 * Carte avec padding et styles par défaut
 */
const Card = ({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-card 
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
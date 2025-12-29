import React from 'react';
import { Workflow } from 'lucide-react';

/**
 * Logo de TaskFlow avec icône et texte
 */
const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-xl' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl' },
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg">
        <Workflow className={`${sizes[size].icon} text-white`} />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent`}>
          TaskFlow
        </span>
      )}
    </div>
  );
};

export default Logo;
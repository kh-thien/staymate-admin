import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon />
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
import React from "react";

const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 text-gray-400">{Icon && <Icon />}</div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

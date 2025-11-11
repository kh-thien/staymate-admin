import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MaintenanceCard } from "./MaintenanceCard";

const statusConfig = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-100 text-yellow-800",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-100 text-green-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-50 border-red-200",
    headerColor: "bg-red-100 text-red-800",
  },
};

export const KanbanColumn = ({ status, maintenanceItems, onCardClick, isOver = false, isDragging = false }) => {
  const { setNodeRef, isOver: isOverColumn } = useDroppable({ 
    id: status,
    data: {
      type: 'column',
      status: status
    }
  });
  const config = statusConfig[status];

  // Determine if this column should show hover effect
  const showHover = isOver || isOverColumn;

  return (
    <div className="flex-1 min-w-[300px]">
      <div
        className={`
          rounded-lg border-2 h-full flex flex-col
          transition-all duration-200 ease-in-out
          ${config.color}
          ${showHover && isDragging 
            ? 'border-blue-500 border-4 shadow-lg ring-4 ring-blue-200 ring-opacity-50 scale-105' 
            : 'border-opacity-50'
          }
          ${isDragging && !showHover ? 'opacity-60' : 'opacity-100'}
        `}
      >
        {/* Column Header */}
        <div
          className={`
            px-4 py-3 rounded-t-lg font-medium transition-colors duration-200
            ${showHover && isDragging 
              ? `${config.headerColor} ring-2 ring-blue-400` 
              : config.headerColor
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span>{config.label}</span>
            <span className={`text-sm px-2 py-1 rounded-full transition-colors ${
              showHover && isDragging 
                ? 'bg-blue-200 text-blue-800 font-semibold' 
                : 'bg-white/50'
            }`}>
              {maintenanceItems.length}
            </span>
          </div>
        </div>

        {/* Column Content - Larger drop zone */}
        <div
          ref={setNodeRef}
          className={`
            flex-1 p-4 overflow-y-auto transition-all duration-200
            ${showHover && isDragging 
              ? 'bg-blue-50/30' 
              : ''
            }
          `}
          style={{ minHeight: "500px" }}
        >
          <SortableContext
            items={maintenanceItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {maintenanceItems.length === 0 ? (
              <div 
                className={`
                  text-center mt-8 transition-all duration-200
                  ${showHover && isDragging 
                    ? 'text-blue-600 font-medium py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50' 
                    : 'text-gray-400'
                  }
                `}
              >
                <p className="text-sm">
                  {showHover && isDragging ? 'Thả vào đây' : 'Không có yêu cầu nào'}
                </p>
              </div>
            ) : (
              maintenanceItems.map((item) => (
                <MaintenanceCard
                  key={item.id}
                  maintenance={item}
                  onClick={onCardClick}
                />
              ))
            )}
          </SortableContext>
          
          {/* Drop indicator when hovering over column with items */}
          {showHover && isDragging && maintenanceItems.length > 0 && (
            <div className="mt-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

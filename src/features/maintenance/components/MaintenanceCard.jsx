import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ClockIcon,
  CurrencyDollarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const priorityConfig = {
  LOW: { label: "Thấp", color: "bg-gray-100 text-gray-700 border-gray-300" },
  MEDIUM: {
    label: "Trung bình",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  HIGH: {
    label: "Cao",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  URGENT: {
    label: "Khẩn cấp",
    color: "bg-red-100 text-red-700 border-red-300",
  },
};

const typeConfig = {
  BUILDING: { label: "Tòa nhà", icon: BuildingOfficeIcon },
  ROOM: { label: "Phòng", icon: HomeIcon },
  OTHER: { label: "Khác", icon: ExclamationCircleIcon },
};

export const MaintenanceCard = ({ maintenance, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: maintenance.id,
    data: {
      type: 'item',
      status: maintenance.status
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = priorityConfig[maintenance.priority] || priorityConfig.LOW;
  const type = typeConfig[maintenance.maintenance_type] || typeConfig.OTHER;
  const TypeIcon = type.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onClick(maintenance)}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'ring-2 ring-blue-400 shadow-lg' : ''}
      `}
    >
      {/* Priority & Type */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs px-2 py-1 rounded-full border ${priority.color}`}
        >
          {priority.label}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <TypeIcon className="w-4 h-4 mr-1" />
          {type.label}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {maintenance.title || "Không có tiêu đề"}
      </h4>

      {/* Description */}
      {maintenance.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {maintenance.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="w-4 h-4 mr-1" />
          {new Date(maintenance.created_at).toLocaleDateString("vi-VN")}
        </div>
        {/* Cost - Required for COMPLETED status */}
        {maintenance.status === "COMPLETED" ? (
          <div className="flex items-center text-xs font-medium text-green-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
            {maintenance.cost 
              ? `${maintenance.cost.toLocaleString("vi-VN")}đ`
              : "Chưa có chi phí"}
          </div>
        ) : maintenance.cost ? (
          <div className="flex items-center text-xs font-medium text-green-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
            {maintenance.cost.toLocaleString("vi-VN")}đ
          </div>
        ) : null}
      </div>

      {/* Reporter */}
      {maintenance.user && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {maintenance.user.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">
                {maintenance.user.full_name || "N/A"}
              </p>
              {/* Hiển thị theo loại bảo trì */}
              {maintenance.maintenance_type === "ROOM" && maintenance.rooms && maintenance.properties?.address ? (
                <p className="text-xs text-gray-600 mt-0.5">
                  {maintenance.rooms.code} - {maintenance.properties.address}
                </p>
              ) : maintenance.properties?.address ? (
                <p className="text-xs text-gray-600 mt-0.5">
                  {maintenance.properties.address}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

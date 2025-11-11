// Maintenance Type ENUM
export const MAINTENANCE_TYPE = {
  BUILDING: "BUILDING",
  ROOM: "ROOM",
  OTHER: "OTHER",
};

export const MAINTENANCE_TYPE_LABELS = {
  [MAINTENANCE_TYPE.BUILDING]: "Bảo trì toà nhà",
  [MAINTENANCE_TYPE.ROOM]: "Bảo trì phòng",
  [MAINTENANCE_TYPE.OTHER]: "Khác",
};

export const MAINTENANCE_TYPE_COLORS = {
  [MAINTENANCE_TYPE.BUILDING]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  [MAINTENANCE_TYPE.ROOM]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  [MAINTENANCE_TYPE.OTHER]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
};

// Maintenance Status ENUM
export const MAINTENANCE_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const MAINTENANCE_STATUS_LABELS = {
  [MAINTENANCE_STATUS.PENDING]: "Chờ xử lý",
  [MAINTENANCE_STATUS.IN_PROGRESS]: "Đang xử lý",
  [MAINTENANCE_STATUS.COMPLETED]: "Hoàn thành",
  [MAINTENANCE_STATUS.CANCELLED]: "Đã hủy",
};

export const MAINTENANCE_STATUS_COLORS = {
  [MAINTENANCE_STATUS.PENDING]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  [MAINTENANCE_STATUS.IN_PROGRESS]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  [MAINTENANCE_STATUS.COMPLETED]: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  [MAINTENANCE_STATUS.CANCELLED]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
};

// Priority levels
export const MAINTENANCE_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const MAINTENANCE_PRIORITY_LABELS = {
  [MAINTENANCE_PRIORITY.LOW]: "Thấp",
  [MAINTENANCE_PRIORITY.MEDIUM]: "Trung bình",
  [MAINTENANCE_PRIORITY.HIGH]: "Cao",
  [MAINTENANCE_PRIORITY.URGENT]: "Khẩn cấp",
};

export const MAINTENANCE_PRIORITY_COLORS = {
  [MAINTENANCE_PRIORITY.LOW]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  [MAINTENANCE_PRIORITY.MEDIUM]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  [MAINTENANCE_PRIORITY.HIGH]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  [MAINTENANCE_PRIORITY.URGENT]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
};

// Helper functions
export const getMaintenanceTypeConfig = (type) => {
  return {
    label: MAINTENANCE_TYPE_LABELS[type] || type,
    ...MAINTENANCE_TYPE_COLORS[type],
  };
};

export const getMaintenanceStatusConfig = (status) => {
  return {
    label: MAINTENANCE_STATUS_LABELS[status] || status,
    ...MAINTENANCE_STATUS_COLORS[status],
  };
};

export const getMaintenancePriorityConfig = (priority) => {
  return {
    label: MAINTENANCE_PRIORITY_LABELS[priority] || priority,
    ...MAINTENANCE_PRIORITY_COLORS[priority],
  };
};

// Check if maintenance can be edited
export const canEditMaintenance = (status) => {
  return (
    status !== MAINTENANCE_STATUS.COMPLETED &&
    status !== MAINTENANCE_STATUS.CANCELLED
  );
};

// Check if maintenance can be cancelled
export const canCancelMaintenance = (status) => {
  return (
    status === MAINTENANCE_STATUS.PENDING ||
    status === MAINTENANCE_STATUS.IN_PROGRESS
  );
};

// Check if maintenance can be marked as completed
export const canCompleteMaintenance = (status) => {
  return status === MAINTENANCE_STATUS.IN_PROGRESS;
};

/**
 * Bill Status Constants
 * Sync with database ENUM: bill_status_enum
 */

export const BILL_STATUS = {
  UNPAID: "UNPAID",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
};

export const BILL_STATUS_LABELS = {
  [BILL_STATUS.UNPAID]: "Chưa thanh toán",
  [BILL_STATUS.PROCESSING]: "Đang xử lý",
  [BILL_STATUS.PAID]: "Đã thanh toán",
  [BILL_STATUS.OVERDUE]: "Quá hạn",
  [BILL_STATUS.CANCELLED]: "Đã hủy",
  [BILL_STATUS.PARTIALLY_PAID]: "Thanh toán một phần",
};

export const BILL_STATUS_COLORS = {
  [BILL_STATUS.UNPAID]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  [BILL_STATUS.PROCESSING]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  [BILL_STATUS.PAID]: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  [BILL_STATUS.OVERDUE]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  [BILL_STATUS.CANCELLED]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  },
  [BILL_STATUS.PARTIALLY_PAID]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
};

/**
 * Get status badge configuration
 */
export const getBillStatusConfig = (status) => {
  return {
    label: BILL_STATUS_LABELS[status] || BILL_STATUS_LABELS[BILL_STATUS.UNPAID],
    ...(BILL_STATUS_COLORS[status] || BILL_STATUS_COLORS[BILL_STATUS.UNPAID]),
  };
};

/**
 * Check if bill can be edited
 */
export const canEditBill = (status) => {
  return status !== BILL_STATUS.PAID && status !== BILL_STATUS.CANCELLED;
};

/**
 * Check if bill can be paid
 */
export const canPayBill = (status) => {
  return (
    status === BILL_STATUS.UNPAID ||
    status === BILL_STATUS.OVERDUE ||
    status === BILL_STATUS.PARTIALLY_PAID
  );
};

/**
 * Check if bill can be cancelled
 */
export const canCancelBill = (status) => {
  return status !== BILL_STATUS.PAID && status !== BILL_STATUS.CANCELLED;
};

/**
 * Domain Types and Entities for Hostel Management
 * Pure business logic types without external dependencies
 */

// Hostel Types
export const HOSTEL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
};

export const HOSTEL_STATUS_LABELS = {
  [HOSTEL_STATUS.ACTIVE]: "Active",
  [HOSTEL_STATUS.INACTIVE]: "Inactive",
  [HOSTEL_STATUS.MAINTENANCE]: "Under Maintenance",
};

// Room Types
export const ROOM_TYPE = {
  SINGLE: "single",
  DOUBLE: "double",
  TRIPLE: "triple",
  QUAD: "quad",
  DORMITORY: "dormitory",
};

export const ROOM_TYPE_LABELS = {
  [ROOM_TYPE.SINGLE]: "Single Room",
  [ROOM_TYPE.DOUBLE]: "Double Room",
  [ROOM_TYPE.TRIPLE]: "Triple Room",
  [ROOM_TYPE.QUAD]: "Quad Room",
  [ROOM_TYPE.DORMITORY]: "Dormitory",
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
};

export const ROOM_STATUS_LABELS = {
  [ROOM_STATUS.AVAILABLE]: "Available",
  [ROOM_STATUS.OCCUPIED]: "Occupied",
  [ROOM_STATUS.MAINTENANCE]: "Under Maintenance",
  [ROOM_STATUS.RESERVED]: "Reserved",
};

// Contract Status
export const CONTRACT_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
  PENDING: "pending",
};

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.ACTIVE]: "Active",
  [CONTRACT_STATUS.EXPIRED]: "Expired",
  [CONTRACT_STATUS.TERMINATED]: "Terminated",
  [CONTRACT_STATUS.PENDING]: "Pending",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: "Pending",
  [PAYMENT_STATUS.PAID]: "Paid",
  [PAYMENT_STATUS.OVERDUE]: "Overdue",
  [PAYMENT_STATUS.CANCELLED]: "Cancelled",
};

// Domain Entities
export const createHostel = (data = {}) => ({
  id: data.id || null,
  name: data.name || "",
  address: data.address || "",
  city: data.city || "",
  state: data.state || "",
  country: data.country || "",
  postal_code: data.postal_code || "",
  phone: data.phone || "",
  email: data.email || "",
  description: data.description || "",
  amenities: data.amenities || [],
  images: data.images || [],
  status: data.status || HOSTEL_STATUS.ACTIVE,
  created_at: data.created_at || null,
  updated_at: data.updated_at || null,
  created_by: data.created_by || null,
});

export const createRoom = (data = {}) => ({
  id: data.id || null,
  hostel_id: data.hostel_id || null,
  room_number: data.room_number || "",
  room_type: data.room_type || ROOM_TYPE.SINGLE,
  floor_number: data.floor_number || 1,
  area_sqft: data.area_sqft || null,
  max_occupancy: data.max_occupancy || 1,
  current_occupancy: data.current_occupancy || 0,
  base_price: data.base_price || 0,
  amenities: data.amenities || [],
  images: data.images || [],
  status: data.status || ROOM_STATUS.AVAILABLE,
  description: data.description || "",
  created_at: data.created_at || null,
  updated_at: data.updated_at || null,
});

export const createRoomInformation = (data = {}) => ({
  id: data.id || null,
  room_id: data.room_id || null,
  bed_type: data.bed_type || "",
  bed_count: data.bed_count || 1,
  has_private_bathroom: data.has_private_bathroom || false,
  has_balcony: data.has_balcony || false,
  has_air_conditioning: data.has_air_conditioning || false,
  has_heating: data.has_heating || false,
  has_wifi: data.has_wifi || true,
  has_tv: data.has_tv || false,
  has_mini_fridge: data.has_mini_fridge || false,
  has_wardrobe: data.has_wardrobe || true,
  has_desk: data.has_desk || false,
  window_type: data.window_type || "",
  floor_type: data.floor_type || "",
  wall_color: data.wall_color || "",
  special_features: data.special_features || [],
  maintenance_notes: data.maintenance_notes || "",
  last_cleaned_at: data.last_cleaned_at || null,
  last_maintenance_at: data.last_maintenance_at || null,
  created_at: data.created_at || null,
  updated_at: data.updated_at || null,
});

export const createContract = (data = {}) => ({
  id: data.id || null,
  room_id: data.room_id || null,
  tenant_id: data.tenant_id || null,
  tenant_name: data.tenant_name || "",
  tenant_email: data.tenant_email || "",
  tenant_phone: data.tenant_phone || "",
  tenant_emergency_contact: data.tenant_emergency_contact || "",
  tenant_emergency_phone: data.tenant_emergency_phone || "",
  start_date: data.start_date || "",
  end_date: data.end_date || "",
  monthly_rent: data.monthly_rent || 0,
  security_deposit: data.security_deposit || 0,
  utilities_included: data.utilities_included || false,
  utilities_cost: data.utilities_cost || 0,
  contract_terms: data.contract_terms || "",
  special_conditions: data.special_conditions || "",
  status: data.status || CONTRACT_STATUS.PENDING,
  payment_due_day: data.payment_due_day || 1,
  late_fee_amount: data.late_fee_amount || 0,
  created_at: data.created_at || null,
  updated_at: data.updated_at || null,
  created_by: data.created_by || null,
});

export const createContractPayment = (data = {}) => ({
  id: data.id || null,
  contract_id: data.contract_id || null,
  amount: data.amount || 0,
  payment_date: data.payment_date || "",
  due_date: data.due_date || "",
  payment_method: data.payment_method || "",
  payment_reference: data.payment_reference || "",
  status: data.status || PAYMENT_STATUS.PENDING,
  notes: data.notes || "",
  created_at: data.created_at || null,
  updated_at: data.updated_at || null,
});

// Form Data Creators
export const createHostelFormData = () => ({
  name: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  phone: "",
  email: "",
  description: "",
  amenities: [],
  images: [],
  status: HOSTEL_STATUS.ACTIVE,
});

export const createRoomFormData = () => ({
  hostel_id: null,
  room_number: "",
  room_type: ROOM_TYPE.SINGLE,
  floor_number: 1,
  area_sqft: null,
  max_occupancy: 1,
  base_price: 0,
  amenities: [],
  images: [],
  status: ROOM_STATUS.AVAILABLE,
  description: "",
});

export const createRoomInfoFormData = () => ({
  room_id: null,
  bed_type: "",
  bed_count: 1,
  has_private_bathroom: false,
  has_balcony: false,
  has_air_conditioning: false,
  has_heating: false,
  has_wifi: true,
  has_tv: false,
  has_mini_fridge: false,
  has_wardrobe: true,
  has_desk: false,
  window_type: "",
  floor_type: "",
  wall_color: "",
  special_features: [],
  maintenance_notes: "",
});

export const createContractFormData = () => ({
  room_id: null,
  tenant_name: "",
  tenant_email: "",
  tenant_phone: "",
  tenant_emergency_contact: "",
  tenant_emergency_phone: "",
  start_date: "",
  end_date: "",
  monthly_rent: 0,
  security_deposit: 0,
  utilities_included: false,
  utilities_cost: 0,
  contract_terms: "",
  special_conditions: "",
  payment_due_day: 1,
  late_fee_amount: 0,
});

// Utility Functions
export const getStatusColor = (status) => {
  const colorMap = {
    [HOSTEL_STATUS.ACTIVE]: "green",
    [HOSTEL_STATUS.INACTIVE]: "gray",
    [HOSTEL_STATUS.MAINTENANCE]: "yellow",
    [ROOM_STATUS.AVAILABLE]: "green",
    [ROOM_STATUS.OCCUPIED]: "red",
    [ROOM_STATUS.MAINTENANCE]: "yellow",
    [ROOM_STATUS.RESERVED]: "blue",
    [CONTRACT_STATUS.ACTIVE]: "green",
    [CONTRACT_STATUS.EXPIRED]: "red",
    [CONTRACT_STATUS.TERMINATED]: "gray",
    [CONTRACT_STATUS.PENDING]: "yellow",
    [PAYMENT_STATUS.PENDING]: "yellow",
    [PAYMENT_STATUS.PAID]: "green",
    [PAYMENT_STATUS.OVERDUE]: "red",
    [PAYMENT_STATUS.CANCELLED]: "gray",
  };

  return colorMap[status] || "gray";
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateDaysUntilExpiry = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isContractExpiringSoon = (endDate, daysThreshold = 30) => {
  const daysUntilExpiry = calculateDaysUntilExpiry(endDate);
  return (
    daysUntilExpiry !== null &&
    daysUntilExpiry <= daysThreshold &&
    daysUntilExpiry >= 0
  );
};

export const isContractOverdue = (endDate) => {
  const daysUntilExpiry = calculateDaysUntilExpiry(endDate);
  return daysUntilExpiry !== null && daysUntilExpiry < 0;
};

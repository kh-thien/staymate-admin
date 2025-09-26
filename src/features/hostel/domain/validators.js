/**
 * Domain Validators for Hostel Management
 * Pure validation functions without external dependencies
 */

import {
  HOSTEL_STATUS,
  ROOM_TYPE,
  ROOM_STATUS,
  CONTRACT_STATUS,
  PAYMENT_STATUS,
} from "./types";

// Hostel Validation
export const validateHostel = (hostelData) => {
  const errors = {};

  if (!hostelData.name || hostelData.name.trim().length === 0) {
    errors.name = "Hostel name is required";
  } else if (hostelData.name.trim().length < 2) {
    errors.name = "Hostel name must be at least 2 characters";
  }

  if (!hostelData.address || hostelData.address.trim().length === 0) {
    errors.address = "Address is required";
  } else if (hostelData.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters";
  }

  if (!hostelData.city || hostelData.city.trim().length === 0) {
    errors.city = "City is required";
  }

  if (!hostelData.state || hostelData.state.trim().length === 0) {
    errors.state = "State is required";
  }

  if (!hostelData.country || hostelData.country.trim().length === 0) {
    errors.country = "Country is required";
  }

  if (
    hostelData.phone &&
    !/^[\+]?[1-9][\d]{0,15}$/.test(hostelData.phone.replace(/[\s\-\(\)]/g, ""))
  ) {
    errors.phone = "Please enter a valid phone number";
  }

  if (
    hostelData.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hostelData.email)
  ) {
    errors.email = "Please enter a valid email address";
  }

  if (
    hostelData.status &&
    !Object.values(HOSTEL_STATUS).includes(hostelData.status)
  ) {
    errors.status = "Invalid hostel status";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Room Validation
export const validateRoom = (roomData) => {
  const errors = {};

  if (!roomData.hostel_id) {
    errors.hostel_id = "Hostel selection is required";
  }

  if (!roomData.room_number || roomData.room_number.trim().length === 0) {
    errors.room_number = "Room number is required";
  }

  if (
    !roomData.room_type ||
    !Object.values(ROOM_TYPE).includes(roomData.room_type)
  ) {
    errors.room_type = "Valid room type is required";
  }

  if (!roomData.floor_number || roomData.floor_number < 0) {
    errors.floor_number = "Floor number must be 0 or greater";
  }

  if (
    roomData.area_sqft !== null &&
    roomData.area_sqft !== undefined &&
    roomData.area_sqft <= 0
  ) {
    errors.area_sqft = "Area must be greater than 0";
  }

  if (!roomData.max_occupancy || roomData.max_occupancy < 1) {
    errors.max_occupancy = "Maximum occupancy must be at least 1";
  }

  if (
    roomData.current_occupancy < 0 ||
    roomData.current_occupancy > roomData.max_occupancy
  ) {
    errors.current_occupancy =
      "Current occupancy cannot exceed maximum occupancy";
  }

  if (!roomData.base_price || roomData.base_price < 0) {
    errors.base_price = "Base price must be 0 or greater";
  }

  if (
    roomData.status &&
    !Object.values(ROOM_STATUS).includes(roomData.status)
  ) {
    errors.status = "Invalid room status";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Room Information Validation
export const validateRoomInformation = (roomInfoData) => {
  const errors = {};

  if (!roomInfoData.room_id) {
    errors.room_id = "Room selection is required";
  }

  if (
    roomInfoData.bed_count !== null &&
    roomInfoData.bed_count !== undefined &&
    roomInfoData.bed_count < 0
  ) {
    errors.bed_count = "Bed count cannot be negative";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Contract Validation
export const validateContract = (contractData) => {
  const errors = {};

  if (!contractData.room_id) {
    errors.room_id = "Room selection is required";
  }

  if (
    !contractData.tenant_name ||
    contractData.tenant_name.trim().length === 0
  ) {
    errors.tenant_name = "Tenant name is required";
  } else if (contractData.tenant_name.trim().length < 2) {
    errors.tenant_name = "Tenant name must be at least 2 characters";
  }

  if (
    !contractData.tenant_email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contractData.tenant_email)
  ) {
    errors.tenant_email = "Valid tenant email is required";
  }

  if (
    contractData.tenant_phone &&
    !/^[\+]?[1-9][\d]{0,15}$/.test(
      contractData.tenant_phone.replace(/[\s\-\(\)]/g, "")
    )
  ) {
    errors.tenant_phone = "Please enter a valid phone number";
  }

  if (!contractData.start_date) {
    errors.start_date = "Start date is required";
  } else {
    const startDate = new Date(contractData.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      errors.start_date = "Start date cannot be in the past";
    }
  }

  if (!contractData.end_date) {
    errors.end_date = "End date is required";
  } else {
    const endDate = new Date(contractData.end_date);
    const startDate = new Date(contractData.start_date);

    if (endDate <= startDate) {
      errors.end_date = "End date must be after start date";
    }
  }

  if (!contractData.monthly_rent || contractData.monthly_rent < 0) {
    errors.monthly_rent = "Monthly rent must be 0 or greater";
  }

  if (contractData.security_deposit < 0) {
    errors.security_deposit = "Security deposit cannot be negative";
  }

  if (contractData.utilities_cost < 0) {
    errors.utilities_cost = "Utilities cost cannot be negative";
  }

  if (contractData.payment_due_day < 1 || contractData.payment_due_day > 31) {
    errors.payment_due_day = "Payment due day must be between 1 and 31";
  }

  if (contractData.late_fee_amount < 0) {
    errors.late_fee_amount = "Late fee amount cannot be negative";
  }

  if (
    contractData.status &&
    !Object.values(CONTRACT_STATUS).includes(contractData.status)
  ) {
    errors.status = "Invalid contract status";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Contract Payment Validation
export const validateContractPayment = (paymentData) => {
  const errors = {};

  if (!paymentData.contract_id) {
    errors.contract_id = "Contract selection is required";
  }

  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.amount = "Payment amount must be greater than 0";
  }

  if (!paymentData.payment_date) {
    errors.payment_date = "Payment date is required";
  }

  if (!paymentData.due_date) {
    errors.due_date = "Due date is required";
  } else {
    const dueDate = new Date(paymentData.due_date);
    const paymentDate = new Date(paymentData.payment_date);

    if (dueDate < paymentDate) {
      errors.due_date = "Due date cannot be before payment date";
    }
  }

  if (
    paymentData.status &&
    !Object.values(PAYMENT_STATUS).includes(paymentData.status)
  ) {
    errors.status = "Invalid payment status";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Search and Filter Validation
export const validateSearchFilters = (filters) => {
  const errors = {};

  if (
    filters.min_price !== null &&
    filters.min_price !== undefined &&
    filters.min_price < 0
  ) {
    errors.min_price = "Minimum price cannot be negative";
  }

  if (
    filters.max_price !== null &&
    filters.max_price !== undefined &&
    filters.max_price < 0
  ) {
    errors.max_price = "Maximum price cannot be negative";
  }

  if (
    filters.min_price !== null &&
    filters.max_price !== null &&
    filters.min_price > filters.max_price
  ) {
    errors.max_price = "Maximum price must be greater than minimum price";
  }

  if (
    filters.min_area !== null &&
    filters.min_area !== undefined &&
    filters.min_area < 0
  ) {
    errors.min_area = "Minimum area cannot be negative";
  }

  if (
    filters.max_area !== null &&
    filters.max_area !== undefined &&
    filters.max_area < 0
  ) {
    errors.max_area = "Maximum area cannot be negative";
  }

  if (
    filters.min_area !== null &&
    filters.max_area !== null &&
    filters.min_area > filters.max_area
  ) {
    errors.max_area = "Maximum area must be greater than minimum area";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Utility Validation Functions
export const validateEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

export const validatePriceRange = (minPrice, maxPrice) => {
  if (minPrice === null || maxPrice === null) return true;
  return maxPrice >= minPrice;
};

export const validateAreaRange = (minArea, maxArea) => {
  if (minArea === null || maxArea === null) return true;
  return maxArea >= minArea;
};

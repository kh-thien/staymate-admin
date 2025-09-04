// Examples of how to use the API endpoints

import {
  authAPI,
  userAPI,
  propertyAPI,
  bookingAPI,
  paymentAPI,
  analyticsAPI,
  fileAPI,
  apiUtils,
} from "./api";

// 🔐 **AUTH EXAMPLES**

// Sign In Example
export const handleSignIn = async (email, password) => {
  try {
    const response = await authAPI.signIn({ email, password });

    // Set token for future requests
    apiUtils.setAuthToken(response.data.access_token);

    console.log("✅ Sign in successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Sign in failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Sign Up Example
export const handleSignUp = async (userData) => {
  try {
    const response = await authAPI.signUp({
      email: userData.email,
      password: userData.password,
      full_name: userData.fullName,
      phone: userData.phone,
    });

    console.log("✅ Sign up successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Sign up failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Forgot Password Example
export const handleForgotPassword = async (email) => {
  try {
    const response = await authAPI.forgotPassword(email);
    console.log("✅ Reset email sent:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Forgot password failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 👥 **USER EXAMPLES**

// Get Users with Pagination
export const fetchUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await userAPI.getUsers({
      page,
      limit,
      search,
      sort: "created_at",
      order: "desc",
    });

    console.log("✅ Users fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Fetch users failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Update User Profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const response = await userAPI.updateUser(userId, updates);
    console.log("✅ User updated:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Update user failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 🏨 **PROPERTY EXAMPLES**

// Get Properties with Filters
export const fetchProperties = async (filters = {}) => {
  try {
    const response = await propertyAPI.getProperties({
      page: filters.page || 1,
      limit: filters.limit || 12,
      city: filters.city,
      property_type: filters.propertyType,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      amenities: filters.amenities,
      availability: filters.availability,
    });

    console.log("✅ Properties fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Fetch properties failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Create New Property
export const createNewProperty = async (propertyData) => {
  try {
    const response = await propertyAPI.createProperty({
      name: propertyData.name,
      description: propertyData.description,
      address: propertyData.address,
      city: propertyData.city,
      property_type: propertyData.propertyType,
      price_per_night: propertyData.pricePerNight,
      max_guests: propertyData.maxGuests,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      amenities: propertyData.amenities,
      images: propertyData.images,
    });

    console.log("✅ Property created:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Create property failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 📅 **BOOKING EXAMPLES**

// Create Booking
export const createNewBooking = async (bookingData) => {
  try {
    const response = await bookingAPI.createBooking({
      property_id: bookingData.propertyId,
      user_id: bookingData.userId,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      guests: bookingData.guests,
      total_amount: bookingData.totalAmount,
      special_requests: bookingData.specialRequests,
    });

    console.log("✅ Booking created:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Create booking failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Get Bookings with Status Filter
export const fetchBookings = async (status = "all", page = 1) => {
  try {
    const params = {
      page,
      limit: 20,
      sort: "created_at",
      order: "desc",
    };

    if (status !== "all") {
      params.status = status;
    }

    const response = await bookingAPI.getBookings(params);

    console.log("✅ Bookings fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Fetch bookings failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 💰 **PAYMENT EXAMPLES**

// Process Payment
export const processPayment = async (paymentData) => {
  try {
    const response = await paymentAPI.processPayment({
      booking_id: paymentData.bookingId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      currency: paymentData.currency || "USD",
      payment_intent_id: paymentData.paymentIntentId,
    });

    console.log("✅ Payment processed:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Payment failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 📊 **ANALYTICS EXAMPLES**

// Get Dashboard Data
export const fetchDashboardData = async (period = "7d") => {
  try {
    const response = await analyticsAPI.getDashboardStats(period);

    console.log("✅ Dashboard data fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Fetch dashboard data failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Get Revenue Analytics
export const fetchRevenueAnalytics = async (startDate, endDate) => {
  try {
    const response = await analyticsAPI.getRevenueAnalytics({
      start_date: startDate,
      end_date: endDate,
      group_by: "day",
    });

    console.log("✅ Revenue analytics fetched:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Fetch revenue analytics failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 📁 **FILE UPLOAD EXAMPLES**

// Upload Property Images
export const uploadPropertyImages = async (files, propertyId) => {
  try {
    const response = await fileAPI.uploadFiles(
      files,
      `properties/${propertyId}`
    );

    console.log("✅ Images uploaded:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Upload failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// Upload User Avatar
export const uploadUserAvatar = async (file, userId) => {
  try {
    const response = await fileAPI.uploadFile(file, `avatars/${userId}`);

    console.log("✅ Avatar uploaded:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Avatar upload failed:", error.response?.data);
    return { success: false, error: error.response?.data };
  }
};

// 🔧 **UTILITY EXAMPLES**

// Generic API Call with Error Handling
export const makeAPICall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ API call failed:", error.response?.data);
    return {
      success: false,
      error: error.response?.data || { message: "Network error" },
    };
  }
};

// Build Search Query
export const buildSearchQuery = (filters) => {
  return apiUtils.buildQueryString({
    q: filters.search,
    city: filters.city,
    property_type: filters.propertyType,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    check_in: filters.checkIn,
    check_out: filters.checkOut,
    guests: filters.guests,
  });
};

// React Hook Examples
import { useState, useEffect } from "react";

// Custom hook for API data fetching
export const useAPIData = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data || { message: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunction, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for paginated data
export const usePaginatedData = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchData = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction({
        ...initialParams,
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      setData(response.data.items || response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      }));
    } catch (err) {
      setError(err.response?.data || { message: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const goToPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  return {
    data,
    loading,
    error,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    refetch: fetchData,
  };
};

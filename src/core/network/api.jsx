import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

// Create axios instance
export const staymateAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - để thêm token vào header
staymateAPI.interceptors.request.use(
  (config) => {
    // Get token from localStorage hoặc context
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - để handle response và errors
staymateAPI.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

// 🏠 **AUTH ENDPOINTS**
export const authAPI = {
  // Sign in
  signIn: (credentials) => staymateAPI.post("/auth/signin", credentials),

  // Sign up
  signUp: (userData) => staymateAPI.post("/auth/signup", userData),

  // Sign out
  signOut: () => staymateAPI.post("/auth/signout"),

  // Refresh token
  refreshToken: (refreshToken) =>
    staymateAPI.post("/auth/refresh", { refresh_token: refreshToken }),

  // Forgot password
  forgotPassword: (email) =>
    staymateAPI.post("/auth/forgot-password", { email }),

  // Reset password
  resetPassword: (token, newPassword) =>
    staymateAPI.post("/auth/reset-password", { token, password: newPassword }),

  // Get current user profile
  getProfile: () => staymateAPI.get("/auth/profile"),

  // Update user profile
  updateProfile: (data) => staymateAPI.put("/auth/profile", data),
};

// 👥 **USER ENDPOINTS**
export const userAPI = {
  // Get all users (admin only)
  getUsers: (params = {}) => staymateAPI.get("/users", { params }),

  // Get user by ID
  getUser: (userId) => staymateAPI.get(`/users/${userId}`),

  // Create user (admin only)
  createUser: (userData) => staymateAPI.post("/users", userData),

  // Update user
  updateUser: (userId, data) => staymateAPI.put(`/users/${userId}`, data),

  // Delete user (admin only)
  deleteUser: (userId) => staymateAPI.delete(`/users/${userId}`),

  // Search users
  searchUsers: (query, filters = {}) =>
    staymateAPI.get("/users/search", { params: { q: query, ...filters } }),
};

// 🏨 **PROPERTY/HOTEL ENDPOINTS**
export const propertyAPI = {
  // Get all properties
  getProperties: (params = {}) => staymateAPI.get("/properties", { params }),

  // Get property by ID
  getProperty: (propertyId) => staymateAPI.get(`/properties/${propertyId}`),

  // Create property
  createProperty: (propertyData) =>
    staymateAPI.post("/properties", propertyData),

  // Update property
  updateProperty: (propertyId, data) =>
    staymateAPI.put(`/properties/${propertyId}`, data),

  // Delete property
  deleteProperty: (propertyId) =>
    staymateAPI.delete(`/properties/${propertyId}`),

  // Get property bookings
  getPropertyBookings: (propertyId, params = {}) =>
    staymateAPI.get(`/properties/${propertyId}/bookings`, { params }),

  // Search properties
  searchProperties: (query, filters = {}) =>
    staymateAPI.get("/properties/search", { params: { q: query, ...filters } }),
};

// 📅 **BOOKING ENDPOINTS**
export const bookingAPI = {
  // Get all bookings
  getBookings: (params = {}) => staymateAPI.get("/bookings", { params }),

  // Get booking by ID
  getBooking: (bookingId) => staymateAPI.get(`/bookings/${bookingId}`),

  // Create booking
  createBooking: (bookingData) => staymateAPI.post("/bookings", bookingData),

  // Update booking
  updateBooking: (bookingId, data) =>
    staymateAPI.put(`/bookings/${bookingId}`, data),

  // Cancel booking
  cancelBooking: (bookingId) =>
    staymateAPI.patch(`/bookings/${bookingId}/cancel`),

  // Confirm booking
  confirmBooking: (bookingId) =>
    staymateAPI.patch(`/bookings/${bookingId}/confirm`),

  // Get user bookings
  getUserBookings: (userId, params = {}) =>
    staymateAPI.get(`/users/${userId}/bookings`, { params }),
};

// 💰 **PAYMENT ENDPOINTS**
export const paymentAPI = {
  // Get payments
  getPayments: (params = {}) => staymateAPI.get("/payments", { params }),

  // Get payment by ID
  getPayment: (paymentId) => staymateAPI.get(`/payments/${paymentId}`),

  // Process payment
  processPayment: (paymentData) => staymateAPI.post("/payments", paymentData),

  // Refund payment
  refundPayment: (paymentId, amount) =>
    staymateAPI.post(`/payments/${paymentId}/refund`, { amount }),

  // Get payment methods
  getPaymentMethods: () => staymateAPI.get("/payments/methods"),

  // Add payment method
  addPaymentMethod: (methodData) =>
    staymateAPI.post("/payments/methods", methodData),
};

// 📊 **ANALYTICS/DASHBOARD ENDPOINTS**
export const analyticsAPI = {
  // Get dashboard stats
  getDashboardStats: (period = "7d") =>
    staymateAPI.get("/analytics/dashboard", { params: { period } }),

  // Get revenue analytics
  getRevenueAnalytics: (params = {}) =>
    staymateAPI.get("/analytics/revenue", { params }),

  // Get booking analytics
  getBookingAnalytics: (params = {}) =>
    staymateAPI.get("/analytics/bookings", { params }),

  // Get user analytics
  getUserAnalytics: (params = {}) =>
    staymateAPI.get("/analytics/users", { params }),

  // Get property performance
  getPropertyPerformance: (propertyId, params = {}) =>
    staymateAPI.get(`/analytics/properties/${propertyId}`, { params }),
};

// 📁 **FILE UPLOAD ENDPOINTS**
export const fileAPI = {
  // Upload single file
  uploadFile: (file, folder = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return staymateAPI.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload multiple files
  uploadFiles: (files, folder = "general") => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append("folder", folder);

    return staymateAPI.post("/files/upload-multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete file
  deleteFile: (fileId) => staymateAPI.delete(`/files/${fileId}`),

  // Get file info
  getFile: (fileId) => staymateAPI.get(`/files/${fileId}`),
};

// 🔧 **UTILITY FUNCTIONS**
export const apiUtils = {
  // Generic GET request
  get: (endpoint, params = {}) => staymateAPI.get(endpoint, { params }),

  // Generic POST request
  post: (endpoint, data = {}) => staymateAPI.post(endpoint, data),

  // Generic PUT request
  put: (endpoint, data = {}) => staymateAPI.put(endpoint, data),

  // Generic PATCH request
  patch: (endpoint, data = {}) => staymateAPI.patch(endpoint, data),

  // Generic DELETE request
  delete: (endpoint) => staymateAPI.delete(endpoint),

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      staymateAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("access_token", token);
    } else {
      delete staymateAPI.defaults.headers.common["Authorization"];
      localStorage.removeItem("access_token");
    }
  },

  // Build query string
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
};

// Export default instance
export default staymateAPI;

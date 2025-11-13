/**
 * Convert technical error messages to user-friendly Vietnamese messages
 */
export const getErrorMessage = (error) => {
  if (!error) return "Đã xảy ra lỗi không xác định";

  const errorMessage = error.message || error.toString();

  // Network errors
  if (errorMessage.includes("network") || 
      errorMessage.includes("fetch") || 
      errorMessage.includes("Failed to fetch")) {
    return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet của bạn.";
  }

  // Permission errors
  if (errorMessage.includes("permission") || 
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("403") ||
      errorMessage.includes("PGRST301")) {
    return "Bạn không có quyền truy cập dữ liệu này. Vui lòng liên hệ quản trị viên.";
  }

  // Not found errors
  if (errorMessage.includes("not found") || 
      errorMessage.includes("404") ||
      errorMessage.includes("PGRST116")) {
    return "Không tìm thấy dữ liệu. Vui lòng thử lại sau.";
  }

  // Database errors
  if (errorMessage.includes("database") || 
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout")) {
    return "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.";
  }

  // Validation errors
  if (errorMessage.includes("validation") || 
      errorMessage.includes("invalid") ||
      errorMessage.includes("required")) {
    return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
  }

  // Rate limit errors
  if (errorMessage.includes("rate limit") || 
      errorMessage.includes("too many requests") ||
      errorMessage.includes("429")) {
    return "Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.";
  }

  // Default: return original message if it's already user-friendly, otherwise generic message
  if (errorMessage.length < 100 && !errorMessage.includes("Error:")) {
    return errorMessage;
  }

  return "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.";
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  if (!error) return false;

  const errorMessage = error.message || error.toString();

  // Network errors are usually retryable
  if (errorMessage.includes("network") || 
      errorMessage.includes("fetch") || 
      errorMessage.includes("timeout")) {
    return true;
  }

  // Rate limit errors are retryable after some time
  if (errorMessage.includes("rate limit") || 
      errorMessage.includes("429")) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (errorMessage.includes("500") || 
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("504")) {
    return true;
  }

  return false;
};


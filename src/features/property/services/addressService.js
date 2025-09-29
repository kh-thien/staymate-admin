// Service để gọi API địa chỉ từ provinces.open-api.vn
const API_BASE_URL = "https://provinces.open-api.vn/api";

export const addressService = {
  // Lấy danh sách tất cả tỉnh/thành phố
  async getProvinces() {
    try {
      const response = await fetch(`${API_BASE_URL}/p/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh/thành phố
  async getDistricts(provinceCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo tỉnh/thành phố
  async getWards(provinceCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=3`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response for wards:", data);

      // Lấy tất cả phường/xã từ các quận/huyện
      const allWards = [];
      if (data.districts) {
        data.districts.forEach((district) => {
          if (district.wards) {
            allWards.push(...district.wards);
          }
        });
      }
      console.log("All wards found:", allWards);
      return allWards;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },

  // Tìm kiếm địa chỉ theo từ khóa
  async searchAddress(query) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching address:", error);
      throw error;
    }
  },
};

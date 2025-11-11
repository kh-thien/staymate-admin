import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { propertyService } from "../services/propertyService";

const AddPropertyModal = ({ isOpen, onClose, onSuccess, editingProperty }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    ward: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form khi edit
  useEffect(() => {
    if (editingProperty && isOpen) {
      setFormData({
        name: editingProperty.name || "",
        address: editingProperty.address || "",
        city: editingProperty.city || "",
        ward: editingProperty.ward || "",
        description: editingProperty.description || "",
      });
    } else if (!editingProperty && isOpen) {
      // Reset form khi tạo mới
      setFormData({
        name: "",
        address: "",
        city: "",
        ward: "",
        description: "",
      });
    }
  }, [editingProperty, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên nhà trọ là bắt buộc";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    }

    if (!formData.ward.trim()) {
      newErrors.ward = "Phường/Xã là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Debug - User object:", user);
    console.log("Debug - user.userId:", user?.userId);
    console.log("Debug - user.id:", user?.id);

    if (!user?.userId && !user?.id) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    setIsLoading(true);

    try {
      const propertyData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        ward: formData.ward.trim(),
        description: formData.description.trim() || null,
        owner_id: user?.userId || user?.id,
      };

      console.log("Property data to send:", propertyData);

      let result;
      if (editingProperty) {
        // Update existing property
        result = await propertyService.updateProperty(
          editingProperty.id,
          propertyData
        );
      } else {
        // Create new property
        result = await propertyService.createProperty(propertyData);
      }

      onSuccess(result);

      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        ward: "",
        description: "",
      });

      onClose();
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Có lỗi xảy ra khi tạo nhà trọ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      ward: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProperty ? "Chỉnh sửa nhà trọ" : "Thêm nhà trọ mới"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tên nhà trọ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhà trọ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên nhà trọ"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Địa chỉ */}

          {/* Tỉnh/Thành phố và Phường/Xã */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tỉnh/thành phố"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.ward ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập phường/xã"
              />
              {errors.ward && (
                <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập địa chỉ chi tiết"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Mô tả về nhà trọ, tiện ích, quy định..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading
                ? editingProperty
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : editingProperty
                ? "Cập nhật nhà trọ"
                : "Tạo nhà trọ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;

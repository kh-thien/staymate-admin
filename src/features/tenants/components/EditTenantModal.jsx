import React, { useState, useEffect } from "react";
import { getEmergencyContact } from "../utils/emergencyContactUtils";

const EditTenantModal = ({ isOpen, onClose, onSubmit, tenant }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    birthdate: "",
    gender: "",
    phone: "",
    email: "",
    hometown: "",
    occupation: "",
    id_number: "",
    note: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && tenant) {
      // Lấy emergency contact từ tenant_emergency_contacts hoặc fallback về cột cũ
      const emergencyContact = getEmergencyContact(tenant);
      
      setFormData({
        fullname: tenant.fullname || "",
        birthdate: tenant.birthdate || "",
        gender: tenant.gender || "",
        phone: tenant.phone || "",
        email: tenant.email || "",
        hometown: tenant.hometown || "",
        occupation: tenant.occupation || "",
        id_number: tenant.id_number || "",
        note: tenant.note || "",
        emergency_contact_name: emergencyContact?.contact_name || "",
        emergency_contact_phone: emergencyContact?.phone || "",
        emergency_contact_relationship: emergencyContact?.relationship || "",
      });
      setErrors({});
    }
  }, [isOpen, tenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Họ tên là bắt buộc";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      formData.birthdate &&
      formData.birthdate > new Date().toISOString().split("T")[0]
    ) {
      newErrors.birthdate = "Ngày sinh không thể trong tương lai";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Process form data to handle empty date fields
      const processedData = {
        ...formData,
        // Convert empty date strings to null for database
        birthdate: formData.birthdate || null,
        // Convert empty strings to null for optional fields
        email: formData.email || null,
        hometown: formData.hometown || null,
        occupation: formData.occupation || null,
        id_number: formData.id_number || null,
        note: formData.note || null,
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error("Error updating tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa người thuê
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Cập nhật thông tin người thuê
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.fullname ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập họ tên"
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.birthdate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.birthdate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.birthdate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sinh viên, Nhân viên, Tự do..."
                  />
                </div>
              </div>
            </div>

            {/* Room Information (Read-only) */}
            {tenant && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin phòng
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {tenant.active_in_room && tenant.rooms ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Phòng đang ở
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {tenant.rooms.code}
                          {tenant.rooms.name && ` - ${tenant.rooms.name}`}
                        </p>
                      </div>
                      {tenant.rooms.properties && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Nhà trọ
                          </label>
                          <p className="text-gray-900">
                            {tenant.rooms.properties.name || "N/A"}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Để thay đổi phòng, vui lòng vào chức năng quản lý phòng để thêm
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Trạng thái
                      </label>
                      <p className="text-gray-500 italic">Chưa có phòng</p>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Để gán phòng, vui lòng vào chức năng quản lý phòng để thêm
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin bổ sung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quê quán
                  </label>
                  <input
                    type="text"
                    name="hometown"
                    value={formData.hometown}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập quê quán"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CMND/CCCD
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số CMND/CCCD"
                  />
                </div>


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ghi chú thêm về người thuê..."
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Liên hệ khẩn cấp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên người liên hệ
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mối quan hệ
                  </label>
                  <select
                    name="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn mối quan hệ</option>
                    <option value="Cha/Mẹ">Cha/Mẹ</option>
                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                    <option value="Bạn bè">Bạn bè</option>
                    <option value="Người thân">Người thân</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenantModal;

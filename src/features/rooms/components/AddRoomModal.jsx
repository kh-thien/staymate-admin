import React, { useState, useEffect } from "react";

const AddRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  propertyId,
  editingRoom = null,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    capacity: 1,
    area_sqm: "",
    monthly_rent: "",
    deposit_amount: "",
    status: "VACANT",
  });
  const [depositMonths, setDepositMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingRoom) {
      setFormData({
        code: editingRoom.code || "",
        name: editingRoom.name || "",
        description: editingRoom.description || "",
        capacity: editingRoom.capacity || 1,
        area_sqm: editingRoom.area_sqm || "",
        monthly_rent: editingRoom.monthly_rent || "",
        deposit_amount: editingRoom.deposit_amount || "",
        status: editingRoom.status || "VACANT",
      });
    } else {
      // Reset form với mặc định VACANT
      setFormData({
        code: "",
        name: "",
        description: "",
        capacity: 1,
        area_sqm: "",
        monthly_rent: "",
        deposit_amount: "",
        status: "VACANT", // Mặc định là phòng trống
      });
    }
    setErrors({});
  }, [editingRoom, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" ||
        name === "monthly_rent" ||
        name === "area_sqm" ||
        name === "deposit_amount"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Tự động tính tiền cọc khi thay đổi tiền thuê
    if (name === "monthly_rent") {
      const rent = parseFloat(value) || 0;
      if (rent > 0) {
        setFormData((prev) => ({
          ...prev,
          deposit_amount: depositMonths * rent,
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      capacity: 1,
      area_sqm: "",
      monthly_rent: "",
      deposit_amount: "",
      status: "VACANT", // Mặc định là phòng trống
    });
    setDepositMonths(1);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Mã phòng là bắt buộc";
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Sức chứa phải lớn hơn 0";
    }

    if (formData.monthly_rent && formData.monthly_rent < 0) {
      newErrors.monthly_rent = "Giá thuê không được âm";
    }

    if (formData.area_sqm && formData.area_sqm < 0) {
      newErrors.area_sqm = "Diện tích không được âm";
    }

    if (depositMonths < 1 || depositMonths > 3) {
      newErrors.deposit_months = "Số tháng cọc phải từ 1 đến 3";
    }

    if (formData.deposit_amount && formData.deposit_amount < 0) {
      newErrors.deposit_amount = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const roomData = {
        ...formData,
        property_id: propertyId,
        current_occupants:
          formData.status === "OCCUPIED" ? formData.capacity : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await onSubmit(roomData);
      resetForm(); // Reset form sau khi submit thành công
      onClose();
    } catch (error) {
      console.error("Error submitting room:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </h2>
          <p className="text-gray-600 mt-1">
            {editingRoom
              ? "Cập nhật thông tin phòng"
              : "Nhập thông tin phòng mới"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phòng *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="VD: P101, P102..."
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sức chứa *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Số người tối đa"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diện tích (m²)
              </label>
              <input
                type="number"
                name="area_sqm"
                value={formData.area_sqm}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.area_sqm ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Diện tích phòng"
              />
              {errors.area_sqm && (
                <p className="text-red-500 text-sm mt-1">{errors.area_sqm}</p>
              )}
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá thuê (VNĐ)
              </label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.monthly_rent ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Giá thuê hàng tháng"
              />
              {errors.monthly_rent && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.monthly_rent}
                </p>
              )}
            </div>

            {/* Deposit Amount */}
            {/* Tiền cọc với option số tháng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tháng cọc
                </label>
                <select
                  name="deposit_months"
                  value={depositMonths}
                  onChange={(e) => {
                    setDepositMonths(parseInt(e.target.value));
                    const rent = parseFloat(formData.monthly_rent) || 0;
                    if (rent > 0) {
                      setFormData((prev) => ({
                        ...prev,
                        deposit_amount: parseInt(e.target.value) * rent,
                      }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.deposit_months ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value={1}>1 tháng</option>
                  <option value={2}>2 tháng</option>
                  <option value={3}>3 tháng</option>
                </select>
                {errors.deposit_months && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.deposit_months}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền cọc (VNĐ)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.deposit_amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tự động tính"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {depositMonths} tháng × {formData.monthly_rent || 0} VNĐ
                </p>
                {errors.deposit_amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.deposit_amount}
                  </p>
                )}
              </div>
            </div>

            {/* Status - Ẩn trạng thái khi thêm phòng mới, mặc định là VACANT */}
            {editingRoom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="VACANT">Trống</option>
                  <option value="OCCUPIED">Đã thuê</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả chi tiết về phòng..."
            />
          </div>

          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên phòng
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tên phòng (tùy chọn)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                resetForm(); // Reset form khi hủy
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Đang xử lý..."
                : editingRoom
                ? "Cập nhật"
                : "Tạo phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;

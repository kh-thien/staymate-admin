import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../../core/data/remote/supabase";

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }) {
  const [formData, setFormData] = useState({
    service_type: "ELECTRIC",
    name: "",
    unit: "",
    price_per_unit: "",
    pricing_note: "",
    is_metered: true,
    property_id: "", // Add property_id field
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Fetch active properties của user hiện tại
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoadingProperties(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("No user found");
          return;
        }

        const { data, error } = await supabase
          .from("properties")
          .select("id, name, address, ward, city, is_active")
          .eq("owner_id", user.id)
          .eq("is_active", true) // Chỉ lấy properties đang active
          .is("deleted_at", null) // Không bị xóa
          .order("name");

        if (error) throw error;

        setProperties(data || []);

        // Auto-select first property if creating new service
        if (!service && data && data.length > 0) {
          setFormData((prev) => ({ ...prev, property_id: data[0].id }));
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        alert("❌ Không thể tải danh sách bất động sản");
      } finally {
        setLoadingProperties(false);
      }
    }

    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen, service]);

  useEffect(() => {
    if (service) {
      setFormData({
        service_type: service.service_type,
        name: service.name,
        unit: service.unit || "",
        price_per_unit: service.price_per_unit || 0,
        pricing_note: service.pricing_note || "",
        is_metered: service.is_metered ?? true,
        property_id: service.property_id || "", // Include property_id when editing
      });
    } else {
      // Reset form khi create mới (property_id will be set by fetchProperties)
      setFormData({
        service_type: "ELECTRIC",
        name: "",
        unit: "",
        price_per_unit: "",
        pricing_note: "",
        is_metered: true,
        property_id: "",
      });
    }
    setErrors({});
  }, [service, isOpen]);

  const handleServiceTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      service_type: type,
      // Auto-fill based on type
      name:
        type === "ELECTRIC"
          ? "Tiền điện"
          : type === "WATER"
          ? "Tiền nước"
          : type === "WIFI"
          ? "Tiền wifi"
          : type === "PARKING"
          ? "Gửi xe"
          : "",
      unit:
        type === "ELECTRIC"
          ? "kWh"
          : type === "WATER"
          ? "m³"
          : type === "WIFI"
          ? "tháng"
          : type === "PARKING"
          ? "xe"
          : "",
      is_metered: type === "ELECTRIC" || type === "WATER",
      // Keep price if already entered
      price_per_unit: prev.price_per_unit || "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_id) {
      newErrors.property_id = "Vui lòng chọn bất động sản";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên dịch vụ";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Vui lòng nhập đơn vị tính";
    }

    if (!formData.price_per_unit || formData.price_per_unit === "") {
      newErrors.price_per_unit = "Vui lòng nhập đơn giá";
    } else if (parseFloat(formData.price_per_unit) <= 0) {
      newErrors.price_per_unit = "Đơn giá phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert price to number before submit
      const submitData = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting service:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {service ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Property Selector */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bất động sản áp dụng <span className="text-red-500">*</span>
              </label>
              {loadingProperties ? (
                <div className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-500">Đang tải...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Bạn chưa có bất động sản nào đang hoạt động. Vui lòng tạo
                    bất động sản trước.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={formData.property_id}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        property_id: e.target.value,
                      }));
                      if (errors.property_id) {
                        setErrors((prev) => ({ ...prev, property_id: null }));
                      }
                    }}
                    required
                    disabled={!!service} // Cannot change property when editing
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                      errors.property_id
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } ${service ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">-- Chọn bất động sản --</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address}, {property.ward},{" "}
                        {property.city}
                      </option>
                    ))}
                  </select>
                  {errors.property_id && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.property_id}
                    </p>
                  )}
                  {service && (
                    <p className="mt-1 text-xs text-gray-500">
                      Không thể thay đổi bất động sản khi chỉnh sửa
                    </p>
                  )}
                  {formData.property_id && !service && (
                    <p className="mt-1 text-xs text-gray-600">
                      📍{" "}
                      {
                        properties.find((p) => p.id === formData.property_id)
                          ?.address
                      }
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Loại dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                required
                disabled={!!service} // Cannot change type when editing
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="ELECTRIC">⚡ Điện</option>
                <option value="WATER">💧 Nước</option>
                <option value="WIFI">📡 Internet/Wifi</option>
                <option value="PARKING">🚗 Gửi xe</option>
                <option value="OTHER">📝 Khác</option>
              </select>
              {service && (
                <p className="mt-1 text-xs text-gray-500">
                  Không thể thay đổi loại dịch vụ khi chỉnh sửa
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: null }));
                  }
                }}
                placeholder="VD: Tiền điện, Tiền nước"
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Đơn vị tính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, unit: e.target.value }));
                  if (errors.unit) {
                    setErrors((prev) => ({ ...prev, unit: null }));
                  }
                }}
                placeholder="VD: kWh, m³, tháng, xe"
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.unit
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.unit && (
                <p className="mt-1 text-xs text-red-600">{errors.unit}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Đơn giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price_per_unit}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    price_per_unit: value,
                  }));
                  // Clear error when user types
                  if (errors.price_per_unit) {
                    setErrors((prev) => ({ ...prev, price_per_unit: null }));
                  }
                }}
                onKeyDown={(e) => {
                  // Chặn dấu trừ (-) và chữ e/E (exponential notation)
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                placeholder="VD: 3500, 20000, 100000"
                min="0"
                step="100"
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.price_per_unit
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.price_per_unit ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.price_per_unit}
                </p>
              ) : formData.price_per_unit && !isNaN(formData.price_per_unit) ? (
                <p className="mt-1 text-xs text-gray-500">
                  {parseFloat(formData.price_per_unit).toLocaleString("vi-VN")}đ
                  / {formData.unit || "đơn vị"}
                </p>
              ) : null}
            </div>

            {/* Is Metered */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                type="checkbox"
                id="is_metered"
                checked={formData.is_metered}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_metered: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_metered"
                className="ml-2 text-sm text-gray-700"
              >
                Có đồng hồ đo (dùng cho điện, nước)
              </label>
            </div>

            {/* Pricing Note */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ghi chú về giá
              </label>
              <textarea
                value={formData.pricing_note || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing_note: e.target.value,
                  }))
                }
                placeholder="VD: Giá theo EVN, Giá theo SAWACO, bao gồm VAT..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang xử lý..." : service ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

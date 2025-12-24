import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  HomeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../../../core/components/ui";
import { supabase } from "../../../core/data/remote/supabase";

const ApproveMaintenanceModal = ({ isOpen, onClose, request, onApprove }) => {
  const [formData, setFormData] = useState({
    property_id: "",
    room_id: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    maintenance_type: "OTHER",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Load properties when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && request) {
      // Determine default maintenance_type based on request
      // If request has room_id, default to ROOM, otherwise default to OTHER
      const defaultMaintenanceType = request.room_id ? "ROOM" : "OTHER";

      // Pre-fill data from request
      setFormData({
        property_id: request.properties_id || "",
        room_id: request.room_id || "",
        title: request.description
          ? `Yêu cầu từ người thuê: ${request.description.substring(0, 60)}${
              request.description.length > 60 ? "..." : ""
            }`
          : "",
        description: request.description || "",
        priority: "MEDIUM",
        maintenance_type: defaultMaintenanceType,
      });
      setErrors({});

      // Load rooms if property_id exists
      if (request.properties_id) {
        loadRooms(request.properties_id);
      }
    }
  }, [isOpen, request]);

  // Load properties
  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  // Load rooms based on property
  const loadRooms = async (propertyId) => {
    if (!propertyId) {
      setRooms([]);
      return;
    }

    try {
      setLoadingRooms(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("id, code, name")
        .eq("property_id", propertyId)
        .is("deleted_at", null)
        .order("code");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle maintenance_type change
    if (name === "maintenance_type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Reset room_id if type is BUILDING or OTHER
        room_id: value === "ROOM" ? prev.room_id : "",
      }));
    }
    // Handle property_id change
    else if (name === "property_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        room_id: "", // Reset room when property changes
      }));
      // Load rooms for selected property
      if (value) {
        loadRooms(value);
      } else {
        setRooms([]);
      }
    }
    // Handle other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_id) {
      newErrors.property_id = "Bất động sản là bắt buộc";
    }

    // Room is required only if maintenance_type is ROOM
    if (formData.maintenance_type === "ROOM" && !formData.room_id) {
      newErrors.room_id = "Phòng là bắt buộc khi loại bảo trì là Phòng";
    }

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "Tiêu đề là bắt buộc";
    } else if (formData.title.length > 255) {
      newErrors.title = "Tiêu đề không được vượt quá 255 ký tự";
    }

    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!formData.priority) {
      newErrors.priority = "Mức độ ưu tiên là bắt buộc";
    }

    if (!formData.maintenance_type) {
      newErrors.maintenance_type = "Loại bảo trì là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onApprove(request.id, {
        property_id: formData.property_id,
        room_id: formData.maintenance_type === "ROOM" ? formData.room_id : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        maintenance_type: formData.maintenance_type,
      });
      onClose();
    } catch (error) {
      console.error("Error approving maintenance request:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="max-h-[85vh] overflow-hidden flex flex-col -mx-6 -my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Phê duyệt yêu cầu bảo trì
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-5">
            {/* Request Information (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Thông tin yêu cầu
              </h3>

              {/* Tenant Information */}
              {request.tenant && (
                <div className="flex items-start gap-2">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Người báo cáo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.tenant.fullname}
                    </p>
                    {request.tenant.phone && (
                      <p className="text-xs text-gray-600">
                        📞 {request.tenant.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Property Information */}
              {request.properties && (
                <div className="flex items-start gap-2">
                  <HomeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Bất động sản</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.properties.name}
                    </p>
                    {request.properties.address && (
                      <p className="text-xs text-gray-600">
                        📍 {request.properties.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Room Information */}
              {request.rooms && (
                <div className="flex items-start gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Phòng</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.rooms.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Original Description */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Mô tả từ tenant</p>
                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                  {request.description}
                </p>
              </div>

              {/* Images */}
              {request.url_report && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Hình ảnh báo cáo</p>
                  <div className="flex flex-wrap gap-2">
                    {request.url_report.split(",").map((url, index) => (
                      <img
                        key={index}
                        src={url.trim()}
                        alt={`Report ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(url.trim(), "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Thông tin công việc bảo trì
              </h3>

              {/* Maintenance Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại bảo trì <span className="text-red-500">*</span>
                </label>
                <select
                  name="maintenance_type"
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.maintenance_type
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="BUILDING">Tòa nhà</option>
                  <option value="ROOM">Phòng</option>
                  <option value="OTHER">Khác</option>
                </select>
                {errors.maintenance_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.maintenance_type}
                  </p>
                )}
              </div>

              {/* Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bất động sản <span className="text-red-500">*</span>
                </label>
                <select
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.property_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn bất động sản</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}{" "}
                      {property.address ? `- ${property.address}` : ""}
                    </option>
                  ))}
                </select>
                {errors.property_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.property_id}
                  </p>
                )}
              </div>

              {/* Room - Only show if maintenance_type is ROOM */}
              {formData.maintenance_type === "ROOM" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    disabled={!formData.property_id || loadingRooms}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.room_id ? "border-red-500" : "border-gray-300"
                    } ${
                      !formData.property_id || loadingRooms
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="">
                      {loadingRooms
                        ? "Đang tải..."
                        : !formData.property_id
                        ? "Chọn bất động sản trước"
                        : "Chọn phòng"}
                    </option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.code} - {room.name}
                      </option>
                    ))}
                  </select>
                  {errors.room_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.room_id}
                    </p>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tiêu đề công việc bảo trì"
                  maxLength={255}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mô tả chi tiết công việc bảo trì"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ ưu tiên <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Phê duyệt và tạo công việc bảo trì"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ApproveMaintenanceModal;

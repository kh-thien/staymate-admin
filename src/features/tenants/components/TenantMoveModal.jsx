import React, { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";

const TenantMoveModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  action = "move_out",
}) => {
  const [formData, setFormData] = useState({
    moveDate: "",
    reason: "",
    note: "",
    newRoomId: "",
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (action === "move_out") {
        setFormData({
          moveDate: new Date().toISOString().split("T")[0],
          reason: "",
          note: "",
          newRoomId: "",
        });
      } else {
        setFormData({
          moveDate: new Date().toISOString().split("T")[0],
          reason: "",
          note: "",
          newRoomId: "",
        });
        fetchAvailableRooms();
      }
    }
  }, [isOpen, action]);

  const fetchAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          id,
          code,
          name,
          status,
          capacity,
          current_occupants,
          properties!inner(name, address)
        `
        )
        .eq("status", "VACANT")
        .order("code");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleChange = (e) => {
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

    if (!formData.moveDate) {
      newErrors.moveDate = "Ngày chuyển là bắt buộc";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Lý do chuyển là bắt buộc";
    }

    if (action === "move_in" && !formData.newRoomId) {
      newErrors.newRoomId = "Phòng mới là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        action,
      });
      onClose();
    } catch (error) {
      console.error("Error processing move:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  action === "move_out" ? "bg-red-100" : "bg-green-100"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    action === "move_out" ? "text-red-600" : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {action === "move_out" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {action === "move_out" ? "Chuyển ra" : "Chuyển vào"}
                </h2>
                <p className="text-sm text-gray-600">{tenant?.fullname}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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

          {/* Current Info */}
          {tenant && (
            <div
              className={`border rounded-lg p-4 mb-6 ${
                action === "move_out"
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Thông tin hiện tại
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phòng hiện tại</p>
                  <p className="font-medium text-gray-900">
                    {tenant.rooms?.code} - {tenant.rooms?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tenant.rooms?.properties?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày chuyển vào</p>
                  <p className="font-medium text-gray-900">
                    {tenant.move_in_date
                      ? new Date(tenant.move_in_date).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Move Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày chuyển <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="moveDate"
                  value={formData.moveDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.moveDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.moveDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.moveDate}</p>
                )}
              </div>

              {/* New Room (for move_in) */}
              {action === "move_in" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng mới <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="newRoomId"
                    value={formData.newRoomId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.newRoomId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.code} - {room.name} ({room.properties?.name})
                      </option>
                    ))}
                  </select>
                  {errors.newRoomId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newRoomId}
                    </p>
                  )}
                  {rooms.length === 0 && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Không có phòng trống nào
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do chuyển <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn lý do</option>
                  {action === "move_out" ? (
                    <>
                      <option value="Hết hạn hợp đồng">Hết hạn hợp đồng</option>
                      <option value="Người thuê yêu cầu">
                        Người thuê yêu cầu
                      </option>
                      <option value="Vi phạm điều khoản">
                        Vi phạm điều khoản
                      </option>
                      <option value="Chủ nhà yêu cầu">Chủ nhà yêu cầu</option>
                      <option value="Lý do khác">Lý do khác</option>
                    </>
                  ) : (
                    <>
                      <option value="Chuyển từ phòng khác">
                        Chuyển từ phòng khác
                      </option>
                      <option value="Người thuê mới">Người thuê mới</option>
                      <option value="Tái ký hợp đồng">Tái ký hợp đồng</option>
                      <option value="Lý do khác">Lý do khác</option>
                    </>
                  )}
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú thêm
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập thông tin bổ sung..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === "move_out"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading
                  ? "Đang xử lý..."
                  : action === "move_out"
                  ? "Chuyển ra"
                  : "Chuyển vào"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantMoveModal;

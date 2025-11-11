import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function MeterReadingModal({ isOpen, onClose, meter, onSubmit }) {
  const [formData, setFormData] = useState({
    new_read: "",
    read_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (meter && isOpen) {
      setFormData({
        new_read: "",
        read_date: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [meter, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_read || formData.new_read === "") {
      newErrors.new_read = "Vui lòng nhập chỉ số mới";
    } else if (parseFloat(formData.new_read) < 0) {
      newErrors.new_read = "Chỉ số không được âm";
    } else if (parseFloat(formData.new_read) < parseFloat(meter.last_read)) {
      newErrors.new_read = `Chỉ số mới phải >= chỉ số cũ (${meter.last_read})`;
    }

    if (!formData.read_date) {
      newErrors.read_date = "Vui lòng chọn ngày đọc";
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
      await onSubmit({
        new_read: parseFloat(formData.new_read),
        read_date: formData.read_date,
      });
      handleClose();
    } catch (error) {
      console.error("Error updating meter reading:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        new_read: "",
        read_date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !meter) return null;

  const consumption =
    formData.new_read &&
    parseFloat(formData.new_read) >= parseFloat(meter.last_read)
      ? parseFloat(formData.new_read) - parseFloat(meter.last_read)
      : 0;

  const service = meter.services || {};
  const room = meter.rooms || {};
  const property = room.properties || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Cập nhật chỉ số đồng hồ
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Meter Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Đồng hồ:</span>{" "}
            <span className="font-medium text-gray-900">
              {meter.meter_code || "N/A"}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Phòng:</span>{" "}
            <span className="font-medium text-gray-900">
              {room.code} - {room.name}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Bất động sản:</span>{" "}
            <span className="font-medium text-gray-900">{property.name}</span>
          </div>
          <div className="text-xs text-gray-500 ml-5 mt-1">
            {[property.address, property.ward, property.city]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Dịch vụ:</span>{" "}
            <span className="font-medium text-gray-900">
              {service.name} ({service.unit})
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Chỉ số hiện tại:</span>{" "}
            <span className="font-bold text-blue-600 text-lg">
              {meter.last_read || 0}
            </span>{" "}
            <span className="text-gray-500">{service.unit}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Ngày đọc cuối:</span>{" "}
            <span className="font-medium text-gray-900">
              {meter.last_read_date
                ? new Date(meter.last_read_date).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* New Reading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chỉ số mới <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.new_read}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, new_read: e.target.value }))
              }
              disabled={loading}
              placeholder={`Nhập chỉ số >= ${meter.last_read}`}
              autoFocus
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errors.new_read ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.new_read && (
              <p className="mt-1 text-sm text-red-500">{errors.new_read}</p>
            )}
          </div>

          {/* Read Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đọc <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.read_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, read_date: e.target.value }))
              }
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errors.read_date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.read_date && (
              <p className="mt-1 text-sm text-red-500">{errors.read_date}</p>
            )}
          </div>

          {/* Consumption Calculation */}
          {formData.new_read &&
            parseFloat(formData.new_read) >= parseFloat(meter.last_read) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Lượng tiêu thụ:
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {consumption.toFixed(2)} {service.unit}
                    </p>
                  </div>
                  {service.price_per_unit && (
                    <div className="text-right">
                      <p className="text-sm text-gray-700 font-medium">
                        Ước tính tiền:
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {(consumption * service.price_per_unit).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p>
                    Chỉ số cũ: {meter.last_read} → Chỉ số mới:{" "}
                    {formData.new_read}
                  </p>
                  {service.price_per_unit && (
                    <p>
                      Đơn giá: {service.price_per_unit.toLocaleString("vi-VN")}{" "}
                      đ/{service.unit}
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật chỉ số"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

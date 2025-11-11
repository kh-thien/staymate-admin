import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../../core/data/remote/supabase";

export function MeterFormModal({ isOpen, onClose, meter, onSubmit }) {
  const [formData, setFormData] = useState({
    property_id: "",
    room_id: "",
    service_id: "",
    meter_code: "",
    last_read: "",
    last_read_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingMeterCode, setCheckingMeterCode] = useState(false);

  // Dropdown data
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);

  // Loading states
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

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
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name");

        if (error) throw error;

        setProperties(data || []);

        // Auto-select first property if creating new meter
        if (!meter && data && data.length > 0) {
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
  }, [isOpen, meter]);

  // Fetch rooms when property changes
  useEffect(() => {
    async function fetchRooms() {
      if (!formData.property_id) {
        setRooms([]);
        return;
      }

      try {
        setLoadingRooms(true);
        const { data, error } = await supabase
          .from("rooms")
          .select("id, code, name")
          .eq("property_id", formData.property_id)
          .is("deleted_at", null) // Only get non-deleted rooms
          .order("code");

        if (error) throw error;

        setRooms(data || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        alert("❌ Không thể tải danh sách phòng");
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchRooms();
  }, [formData.property_id]);

  // Fetch metered services when property changes
  useEffect(() => {
    async function fetchServices() {
      if (!formData.property_id) {
        setServices([]);
        return;
      }

      try {
        setLoadingServices(true);
        const { data, error } = await supabase
          .from("services")
          .select("id, name, service_type, unit, is_metered")
          .eq("property_id", formData.property_id)
          .eq("is_metered", true) // Only metered services (ELECTRIC, WATER)
          .order("service_type");

        if (error) throw error;

        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        alert("❌ Không thể tải danh sách dịch vụ");
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
  }, [formData.property_id]);

  // Function to manually generate meter code
  const handleGenerateMeterCode = () => {
    if (!formData.room_id || !formData.service_id) {
      alert("Vui lòng chọn phòng và dịch vụ trước!");
      return;
    }

    const room = rooms.find((r) => r.id === formData.room_id);
    const service = services.find((s) => s.id === formData.service_id);

    if (room && service) {
      const serviceCode =
        service.service_type === "ELECTRIC"
          ? "DIEN"
          : service.service_type === "WATER"
          ? "NUOC"
          : "DV";
      // Generate unique suffix using timestamp (last 4 digits of timestamp in base36)
      const uniqueSuffix = Date.now().toString(36).slice(-4).toUpperCase();
      const meterCode = `DH-${serviceCode}-${room.code}-${uniqueSuffix}`;
      setFormData((prev) => ({ ...prev, meter_code: meterCode }));
    }
  };

  // Check if meter_code already exists when user manually enters it
  useEffect(() => {
    // Check meter_code is manually entered and not empty
    if (formData.meter_code && formData.meter_code.trim()) {
      const checkMeterCode = async () => {
        setCheckingMeterCode(true);

        try {
          let query = supabase
            .from("meters")
            .select("id")
            .eq("meter_code", formData.meter_code.trim());

          // When editing, exclude current meter from check
          if (meter) {
            query = query.neq("id", meter.id);
          }

          const { data, error } = await query.maybeSingle();

          if (error) {
            console.error("Error checking meter code:", error);
            return;
          }

          if (data) {
            setErrors((prev) => ({
              ...prev,
              meter_code:
                "❌ Mã đồng hồ đã tồn tại. Vui lòng nhập mã khác hoặc để trống để tự động tạo.",
            }));
          } else {
            // Clear meter_code error if it exists and code is unique
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.meter_code;
              return newErrors;
            });
          }
        } catch (err) {
          console.error("Error checking meter code:", err);
        } finally {
          setCheckingMeterCode(false);
        }
      };

      // Debounce: wait 500ms after user stops typing
      const timeoutId = setTimeout(checkMeterCode, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // Clear error if meter_code is empty
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.meter_code;
        return newErrors;
      });
    }
  }, [formData.meter_code, meter]);

  // Load meter data when editing
  useEffect(() => {
    if (meter && isOpen) {
      // When editing, we need to load the property_id from the meter's room
      const loadMeterData = async () => {
        try {
          const { data: roomData, error } = await supabase
            .from("rooms")
            .select("property_id")
            .eq("id", meter.room_id)
            .single();

          if (error) throw error;

          setFormData({
            property_id: roomData.property_id,
            room_id: meter.room_id,
            service_id: meter.service_id,
            meter_code: meter.meter_code || "",
            last_read: meter.last_read?.toString() || "",
            last_read_date:
              meter.last_read_date || new Date().toISOString().split("T")[0],
          });
        } catch (error) {
          console.error("Error loading meter data:", error);
        }
      };

      loadMeterData();
    } else if (!meter) {
      // Reset form when creating new
      setFormData({
        property_id: "",
        room_id: "",
        service_id: "",
        meter_code: "",
        last_read: "",
        last_read_date: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [meter, isOpen, properties]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_id) {
      newErrors.property_id = "Vui lòng chọn bất động sản";
    }

    if (!formData.room_id) {
      newErrors.room_id = "Vui lòng chọn phòng";
    }

    if (!formData.service_id) {
      newErrors.service_id = "Vui lòng chọn dịch vụ";
    }

    // meter_code is now required
    if (!formData.meter_code || !formData.meter_code.trim()) {
      newErrors.meter_code = "Vui lòng nhập mã đồng hồ hoặc nhấn nút Tạo mã";
    }

    if (!formData.last_read || formData.last_read === "") {
      newErrors.last_read = "Vui lòng nhập chỉ số";
    } else if (parseFloat(formData.last_read) < 0) {
      newErrors.last_read = "Chỉ số không được âm";
    }

    if (!formData.last_read_date) {
      newErrors.last_read_date = "Vui lòng chọn ngày đọc";
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
      const finalMeterCode = formData.meter_code.trim();

      // Check if meter_code already exists
      let query = supabase
        .from("meters")
        .select("id")
        .eq("meter_code", finalMeterCode);

      // When editing, exclude current meter from check
      if (meter) {
        query = query.neq("id", meter.id);
      }

      const { data: existingMeter, error: checkError } =
        await query.maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingMeter) {
        setErrors({
          meter_code:
            "Mã đồng hồ đã tồn tại. Vui lòng nhập mã khác hoặc để trống để tự động tạo.",
        });
        setLoading(false);
        return;
      }

      // Prepare data (remove property_id as it's not in meters table)
      const meterData = {
        room_id: formData.room_id,
        service_id: formData.service_id,
        meter_code: finalMeterCode,
        last_read: parseFloat(formData.last_read),
        last_read_date: formData.last_read_date,
      };

      await onSubmit(meterData);
      handleClose();
    } catch (error) {
      console.error("Error submitting meter:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        property_id: "",
        room_id: "",
        service_id: "",
        meter_code: "",
        last_read: "",
        last_read_date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {meter ? "Sửa đồng hồ" : "Thêm đồng hồ mới"}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bất động sản <span className="text-red-500">*</span>
            </label>
            {loadingProperties ? (
              <div className="text-sm text-gray-500">
                Đang tải bất động sản...
              </div>
            ) : (
              <>
                <select
                  value={formData.property_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      property_id: e.target.value,
                      room_id: "", // Reset room when property changes
                      service_id: "", // Reset service when property changes
                    }))
                  }
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.property_id ? "border-red-500" : "border-gray-300"
                  }`}
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.property_id}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng <span className="text-red-500">*</span>
            </label>
            {loadingRooms ? (
              <div className="text-sm text-gray-500">Đang tải phòng...</div>
            ) : (
              <>
                <select
                  value={formData.room_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      room_id: e.target.value,
                    }))
                  }
                  disabled={!formData.property_id || loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.room_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.name}
                    </option>
                  ))}
                </select>
                {errors.room_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.room_id}</p>
                )}
                {rooms.length === 0 && formData.property_id && (
                  <p className="mt-1 text-xs text-yellow-600">
                    ⚠️ Không có phòng nào khả dụng cho bất động sản này
                  </p>
                )}
              </>
            )}
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dịch vụ <span className="text-red-500">*</span>
            </label>
            {loadingServices ? (
              <div className="text-sm text-gray-500">Đang tải dịch vụ...</div>
            ) : (
              <>
                <select
                  value={formData.service_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_id: e.target.value,
                    }))
                  }
                  disabled={!formData.property_id || loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.service_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.service_type}) - Đơn vị:{" "}
                      {service.unit}
                    </option>
                  ))}
                </select>
                {errors.service_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.service_id}
                  </p>
                )}
                {services.length === 0 && formData.property_id && (
                  <p className="mt-1 text-xs text-yellow-600">
                    ⚠️ Không có dịch vụ có đồng hồ nào cho bất động sản này. Vui
                    lòng tạo dịch vụ ĐIỆN hoặc NƯỚC trước.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Meter Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã đồng hồ <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formData.meter_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meter_code: e.target.value,
                    }))
                  }
                  disabled={
                    loading || !formData.room_id || !formData.service_id
                  }
                  placeholder="Nhập mã đồng hồ (VD: DH-DIEN-P101)"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.meter_code ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {checkingMeterCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleGenerateMeterCode}
                disabled={loading || !formData.room_id || !formData.service_id}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                title="Tạo mã tự động"
              >
                Tạo mã
              </button>
            </div>
            {errors.meter_code && (
              <p className="mt-1 text-sm text-red-500">{errors.meter_code}</p>
            )}
            {!errors.meter_code &&
              formData.meter_code &&
              !checkingMeterCode && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Mã đồng hồ hợp lệ
                </p>
              )}
            <p className="mt-1 text-xs text-gray-500">
              💡 Nhập mã từ đồng hồ thực tế hoặc nhấn "Tạo mã" để tạo mã tự động
            </p>
          </div>

          {/* Last Read */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chỉ số hiện tại <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.last_read}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_read: e.target.value,
                  }))
                }
                disabled={loading || !formData.room_id || !formData.service_id}
                placeholder="Nhập chỉ số hiện tại (VD: 0)"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.last_read ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.last_read && (
                <p className="mt-1 text-sm text-red-500">{errors.last_read}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đọc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.last_read_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_read_date: e.target.value,
                  }))
                }
                disabled={loading || !formData.room_id || !formData.service_id}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.last_read_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.last_read_date && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.last_read_date}
                </p>
              )}
            </div>
          </div>

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
              {loading ? "Đang xử lý..." : meter ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

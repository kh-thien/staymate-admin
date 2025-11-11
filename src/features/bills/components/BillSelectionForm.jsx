import React from "react";
import ContractInfoCard from "./ContractInfoCard";

// Room status labels in Vietnamese (sync with room_status enum)
const ROOM_STATUS_LABELS = {
  VACANT: "Trống",
  OCCUPIED: "Đang thuê",
  MAINTENANCE: "Bảo trì",
  DEPOSITED: "Đã đặt cọc",
};

const BillSelectionForm = ({
  formData,
  errors,
  properties,
  rooms,
  tenants,
  currentContract,
  loading,
  loadingData,
  bill,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4 border-r pr-6">
      {/* Step 1: Property Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          1. Chọn bất động sản <span className="text-red-500">*</span>
        </label>
        <select
          name="property_id"
          value={formData.property_id}
          onChange={onChange}
          disabled={loading || loadingData || !!bill || disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.property_id
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } ${bill || disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">-- Chọn bất động sản --</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} - {property.address}
            </option>
          ))}
        </select>
        {errors.property_id && (
          <p className="text-red-500 text-sm mt-1">{errors.property_id}</p>
        )}
      </div>

      {/* Step 2: Room Selection */}
      {formData.property_id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            2. Chọn phòng <span className="text-red-500">*</span>
          </label>
          <select
            name="room_id"
            value={formData.room_id}
            onChange={onChange}
            disabled={loading || loadingData || !!bill || disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.room_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } ${bill || disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">-- Chọn phòng --</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.code} - {room.name} (
                {ROOM_STATUS_LABELS[room.status] || room.status})
              </option>
            ))}
          </select>
          {errors.room_id && (
            <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>
          )}
        </div>
      )}

      {/* Step 3: Tenant Selection */}
      {formData.room_id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3. Chọn khách thuê <span className="text-red-500">*</span>
          </label>
          <select
            name="tenant_id"
            value={formData.tenant_id}
            onChange={onChange}
            disabled={loading || loadingData || !!bill || disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.tenant_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } ${bill || disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">-- Chọn khách thuê --</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.fullname} - {tenant.phone}
              </option>
            ))}
          </select>
          {errors.tenant_id && (
            <p className="text-red-500 text-sm mt-1">{errors.tenant_id}</p>
          )}
          {tenants.length === 0 && (
            <p className="text-yellow-600 text-sm mt-1">
              ⚠️ Không có khách thuê nào đang ở phòng này
            </p>
          )}
        </div>
      )}

      {/* Contract Info Display */}
      <ContractInfoCard contract={currentContract} />

      {loadingData && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">Đang tải dữ liệu...</p>
        </div>
      )}
    </div>
  );
};

export default BillSelectionForm;

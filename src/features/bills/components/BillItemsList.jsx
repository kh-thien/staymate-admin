import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

const BillItemsList = ({ items, onChange, disabled }) => {
  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        // For metered services, calculate consumption
        if (item.meter_id) {
          // Validate: only numbers, no negative, must be >= old_reading
          const oldReading = parseFloat(item.old_reading || 0);
          
          // Allow empty string for placeholder
          if (newQuantity === "" || newQuantity === null || newQuantity === undefined) {
            return {
              ...item,
              new_reading: "",
              quantity: 0,
              amount: 0,
              _validationWarning: null, // Clear warning
            };
          }

          // Parse the value
          const newReadingNum = parseFloat(newQuantity);
          
          // Validate: must be a valid number
          if (isNaN(newReadingNum)) {
            // Allow typing invalid partial numbers (like "2" when old is 300)
            // But still update the input value
            return {
              ...item,
              new_reading: newQuantity, // Allow typing
              quantity: 0,
              amount: 0,
              _validationWarning: null,
            };
          }

          // Validate: must be >= 0
          if (newReadingNum < 0) {
            return {
              ...item,
              new_reading: item.new_reading || "", // Keep previous value
              quantity: item.quantity || 0,
              amount: item.amount || 0,
              _validationWarning: "Không được nhập số âm",
            };
          }

          // Allow typing even if less than old reading (user might be typing)
          // But set warning and don't calculate consumption yet
          if (newReadingNum < oldReading) {
            return {
              ...item,
              new_reading: newQuantity, // Allow typing
              quantity: 0,
              amount: 0,
              _validationWarning: `Số mới (${newReadingNum}) phải lớn hơn hoặc bằng số cũ (${oldReading})`,
            };
          }

          // Valid value: calculate consumption
          const consumption = newReadingNum - oldReading;
          return {
            ...item,
            new_reading: newQuantity, // Keep original string value for input display
            quantity: consumption,
            amount: consumption * parseFloat(item.unit_price || 0),
            _validationWarning: null, // Clear warning
          };
        }

        // For non-metered services
        // Allow empty string for placeholder
        if (newQuantity === "" || newQuantity === null || newQuantity === undefined) {
          return {
            ...item,
            quantity: 0,
            amount: 0,
          };
        }

        const quantityValue = parseFloat(newQuantity);
        
        // Validate: must be a valid number and >= 0
        if (isNaN(quantityValue) || quantityValue < 0) {
          return item; // Don't update if invalid or negative
        }

        const amount = quantityValue * parseFloat(item.unit_price || 0);
        return { 
          ...item, 
          quantity: quantityValue, // Store as number for calculation
          amount 
        };
      }
      return item;
    });
    onChange(updatedItems);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onChange(updatedItems);
  };

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn vị
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn giá
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành tiền
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {item.description}
                  </div>
                  {item.meter_id && (
                    <div className="text-xs text-gray-500">
                      Chỉ số cũ: {item.old_reading || 0}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.meter_id ? (
                    <div className="space-y-1">
                      <input
                        type="number"
                        value={item.new_reading || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and decimal point
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            handleQuantityChange(item.id, value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent negative sign
                          if (e.key === "-" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          // Validate on blur
                          const value = parseFloat(e.target.value);
                          const oldReading = parseFloat(item.old_reading || 0);
                          if (value && value < oldReading) {
                            // Set input to old reading if less than old
                            handleQuantityChange(item.id, oldReading.toString());
                        }
                        }}
                        disabled={disabled}
                        min={item.old_reading || 0}
                        step="0.01"
                        className={`w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 ${
                          item._validationWarning
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Số mới"
                        required
                      />
                      {item._validationWarning && (
                        <div className="text-xs text-red-600">
                          ⚠️ {item._validationWarning}
                        </div>
                      )}
                      <div className="text-xs text-gray-600">
                        Tiêu thụ: {formatCurrency(item.quantity)}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      disabled={disabled || item.service_id === null}
                      min="0"
                      step="0.01"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập số lượng *"
                      required
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="text-gray-600">
                    {item.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(item.unit_price)}đ
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(item.amount)}đ
                </td>
                <td className="px-4 py-3 text-center">
                  {item.service_id !== null && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Xóa dịch vụ"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td
                colSpan="4"
                className="px-4 py-3 text-sm font-medium text-gray-700 text-right"
              >
                Tổng phụ:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                {formatCurrency(
                  items.reduce(
                    (sum, item) => sum + parseFloat(item.amount || 0),
                    0
                  )
                )}
                đ
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          💡 <strong>Lưu ý:</strong>
        </p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Tiền thuê phòng không thể xóa</li>
          <li>Dịch vụ đo đếm (điện, nước): Nhập chỉ số mới để tính tiêu thụ</li>
          <li>Dịch vụ không đo đếm: Có thể xóa hoặc điều chỉnh số lượng</li>
        </ul>
      </div>
    </div>
  );
};

export default BillItemsList;

import React from "react";
import Input from "../../../core/components/ui/Input";

const BillSummarySection = ({
  formData,
  billItems,
  loading,
  onChange,
  totalAmount,
  disabled = false,
}) => {
  if (billItems.length === 0) return null;

  const isDisabled = loading || disabled;

  return (
    <>
      {/* Late Fee, Discount & Notes */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800">
          💰 Phạt trễ hạn, Giảm giá & Ghi chú
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phí trễ hạn (đ)"
            type="number"
            name="late_fee"
            value={formData.late_fee}
            onChange={onChange}
            disabled={isDisabled}
            min="0"
          />
          <Input
            label="Giảm giá (đ)"
            type="number"
            name="discount_amount"
            value={formData.discount_amount}
            onChange={onChange}
            disabled={isDisabled}
            min="0"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onChange}
            disabled={isDisabled}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Nhập ghi chú cho hóa đơn..."
          />
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 sticky top-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tổng dịch vụ:</span>
            <span>
              {billItems
                .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
                .toLocaleString("vi-VN")}
              đ
            </span>
          </div>
          {parseFloat(formData.late_fee) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí trễ hạn:</span>
              <span className="text-red-600">
                +{parseFloat(formData.late_fee).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
          {parseFloat(formData.discount_amount) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Giảm giá:</span>
              <span className="text-green-600">
                -{parseFloat(formData.discount_amount).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-blue-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
                Tổng cộng:
              </span>
              <span className="text-xl font-bold text-blue-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillSummarySection;

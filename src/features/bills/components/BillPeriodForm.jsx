import React from "react";
import Input from "../../../core/components/ui/Input";
import Button from "../../../core/components/ui/Button";

const BillPeriodForm = ({
  formData,
  errors,
  loading,
  loadingData,
  currentContract,
  onChange,
  onGenerateBillNumber,
  bill, // Added for edit mode
  disabled = false,
}) => {
  if (!currentContract) return null;

  const isEditMode = !!bill;
  const isDisabled = loading || isEditMode || disabled;

  return (
    <div className="space-y-3 pb-4 border-b">
      <h4 className="font-medium text-gray-800">📅 Thông tin kỳ hóa đơn</h4>
      {/* Bill Name - Full width */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Tên hóa đơn <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          error={errors.name}
          placeholder="Nhập tên hóa đơn (tối đa 50 ký tự)"
          disabled={disabled}
          required
          maxLength={50}
          className={disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
        {formData.name && (
          <p className="text-xs text-gray-500 mt-1">
            {formData.name.length}/50 ký tự
          </p>
        )}
      </div>
      {/* All 4 fields in one row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Bill Number with Generate Button */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Mã hóa đơn <span className="text-red-500">*</span>
            {isEditMode && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Chỉ xem)
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                name="bill_number"
                value={formData.bill_number}
                onChange={onChange}
                error={errors.bill_number}
                placeholder="Nhập mã hoặc nhấn 'Tạo mã'"
                disabled={isDisabled}
                required
                className={`flex-1 ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {isDisabled && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                  🔒
                </span>
              )}
            </div>
            {!isDisabled && (
              <Button
                type="button"
                variant="secondary"
                onClick={onGenerateBillNumber}
                disabled={loading || loadingData || !currentContract}
                className="whitespace-nowrap text-xs px-2 py-1"
              >
                Tạo mã
              </Button>
            )}
          </div>
          {errors.bill_number && (
            <p className="text-red-500 text-xs mt-1">{errors.bill_number}</p>
          )}
        </div>
        <Input
          label="Từ ngày"
          type="date"
          name="period_start"
          value={formData.period_start}
          onChange={onChange}
          error={errors.period_start}
          required
          disabled={isDisabled}
        />
        <Input
          label="Đến ngày"
          type="date"
          name="period_end"
          value={formData.period_end}
          onChange={onChange}
          error={errors.period_end}
          required
          disabled={isDisabled}
        />
        <Input
          label="Hạn thanh toán"
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={onChange}
          error={errors.due_date}
          required
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default BillPeriodForm;


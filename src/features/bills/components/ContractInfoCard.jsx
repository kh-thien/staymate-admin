import React from "react";

const ContractInfoCard = ({ contract }) => {
  if (!contract) return null;

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <h4 className="font-medium text-green-800 mb-3">✅ Thông tin hợp đồng</h4>
      <div className="text-sm text-gray-700 space-y-2">
        {/* Basic Info */}
        <div className="pb-2 border-b border-green-200">
          <p>
            <strong>Số HĐ:</strong> {contract.contract_number}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className="text-green-600 font-medium">
              {contract.status}
            </span>
          </p>
        </div>

        {/* Tenant & Room Info */}
        <div className="pb-2 border-b border-green-200">
          <p>
            <strong>Khách thuê:</strong> {contract.tenants?.fullname}
          </p>
          {contract.tenants?.phone && (
            <p className="text-xs text-gray-600 pl-4">
              📞 {contract.tenants.phone}
            </p>
          )}
          {contract.tenants?.email && (
            <p className="text-xs text-gray-600 pl-4">
              ✉️ {contract.tenants.email}
            </p>
          )}
          <p className="mt-1">
            <strong>Phòng:</strong> {contract.rooms?.code}
            {contract.rooms?.name && ` - ${contract.rooms.name}`}
          </p>
        </div>

        {/* Financial Info */}
        <div className="pb-2 border-b border-green-200">
          <p>
            <strong>Tiền thuê:</strong>{" "}
            <span className="text-lg font-semibold text-green-700">
              {parseFloat(contract.monthly_rent || 0).toLocaleString("vi-VN")}đ
            </span>
            <span className="text-xs text-gray-600">/tháng</span>
          </p>
          {contract.deposit_amount && (
            <p>
              <strong>Tiền đặt cọc:</strong>{" "}
              {parseFloat(contract.deposit_amount).toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>

        {/* Contract Period */}
        <div className="pb-2 border-b border-green-200">
          <p>
            <strong>Ngày bắt đầu:</strong>{" "}
            {contract.start_date
              ? new Date(contract.start_date).toLocaleDateString("vi-VN")
              : "N/A"}
          </p>
          <p>
            <strong>Ngày kết thúc:</strong>{" "}
            {contract.end_date
              ? new Date(contract.end_date).toLocaleDateString("vi-VN")
              : "N/A"}
          </p>
        </div>

        {/* Payment Information */}
        <div className="pb-2 border-b border-green-200">
          <p className="font-semibold text-green-700 mb-1">
            💰 Thông tin thanh toán
          </p>
          <div className="text-xs space-y-1">
            {contract.payment_cycle && (
              <p>
                <strong>Chu kỳ:</strong>{" "}
                {contract.payment_cycle === "MONTHLY"
                  ? "Hàng tháng"
                  : contract.payment_cycle === "WEEKLY"
                  ? "Hàng tuần"
                  : contract.payment_cycle === "QUARTERLY"
                  ? "Hàng quý"
                  : contract.payment_cycle === "YEARLY"
                  ? "Hàng năm"
                  : contract.payment_cycle}
              </p>
            )}
            {contract.payment_frequency && contract.payment_frequency > 1 && (
              <p>
                <strong>Tần suất:</strong> Mỗi {contract.payment_frequency}{" "}
                {contract.payment_cycle === "MONTHLY"
                  ? "tháng"
                  : contract.payment_cycle === "WEEKLY"
                  ? "tuần"
                  : "kỳ"}
              </p>
            )}
            {contract.payment_day_type === "FIXED_DAYS" &&
              contract.payment_day && (
                <p>
                  <strong>Ngày thanh toán:</strong> Hàng tháng vào ngày{" "}
                  {contract.payment_day}
                </p>
              )}
            {contract.payment_day_type === "CUSTOM_DAYS" &&
              contract.payment_days &&
              Array.isArray(contract.payment_days) &&
              contract.payment_days.length > 0 && (
                <p>
                  <strong>Ngày thanh toán:</strong> Ngày{" "}
                  {contract.payment_days.join(", ")} hàng tháng
                </p>
              )}
          </div>
        </div>

        {/* Additional Info */}
        {contract.notes && (
          <div className="pt-2 border-t border-green-200">
            <p className="text-xs">
              <strong>Ghi chú:</strong>
            </p>
            <p className="text-xs text-gray-600 italic pl-2">
              {contract.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractInfoCard;

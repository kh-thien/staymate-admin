import React from "react";
import Modal from "../../../core/components/ui/Modal";
import Button from "../../../core/components/ui/Button";
import StatusBadge from "../../../core/components/ui/StatusBadge";

const BillViewModal = ({ isOpen, onClose, bill }) => {
  if (!bill) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    return <StatusBadge status={status} />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết hóa đơn"
      size="xl"
      className="!max-w-[80vw]"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tên hóa đơn</p>
              <p className="font-semibold text-gray-900">{bill.name || "Hóa đơn"}</p>
              <p className="text-xs text-gray-500 mt-1">Mã: {bill.bill_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              {getStatusBadge(bill.status)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-bold text-blue-600 text-lg">
                {formatCurrency(bill.total_amount)}đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hạn thanh toán</p>
              <p className="font-semibold text-red-600">
                {formatDate(bill.due_date)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contract & Room Info */}
          <div className="space-y-4">
            {/* Contract Info */}
            {bill.contracts && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  📋 Thông tin hợp đồng
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Số HĐ:</strong> {bill.contracts.contract_number}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        bill.contracts.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {bill.contracts.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : bill.contracts.status}
                    </span>
                  </p>
                  {bill.contracts.rooms && (
                    <>
                      <p>
                        <strong>Phòng:</strong> {bill.contracts.rooms.code} -{" "}
                        {bill.contracts.rooms.name}
                      </p>
                      {bill.contracts.rooms.properties && (
                        <p>
                          <strong>Tòa nhà:</strong>{" "}
                          {bill.contracts.rooms.properties.name}
                        </p>
                      )}
                    </>
                  )}
                  {bill.contracts.tenants && (
                    <>
                      <p>
                        <strong>Khách thuê:</strong>{" "}
                        {bill.contracts.tenants.fullname}
                      </p>
                      <p>
                        <strong>SĐT:</strong> {bill.contracts.tenants.phone}
                      </p>
                      {bill.contracts.tenants.email && (
                        <p>
                          <strong>Email:</strong> {bill.contracts.tenants.email}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Bill Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Period Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">
                📅 Kỳ thanh toán
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Từ ngày</p>
                  <p className="font-semibold">
                    {formatDate(bill.period_start)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Đến ngày</p>
                  <p className="font-semibold">{formatDate(bill.period_end)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Hạn thanh toán</p>
                  <p className="font-semibold text-red-600">
                    {formatDate(bill.due_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill Items */}
            {bill.bill_items && bill.bill_items.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">
                    📝 Chi tiết dịch vụ ({bill.bill_items.length} dịch vụ)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Dịch vụ
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Số lượng
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Đơn vị
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Đơn giá
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bill.bill_items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.description}
                              </p>
                              {item.services && (
                                <p className="text-xs text-gray-500">
                                  {item.services.name}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {item.services?.unit || item.unit || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatCurrency(item.unit_price)}đ
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold">
                            {formatCurrency(item.amount)}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                        >
                          Tổng cộng:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(
                            bill.bill_items.reduce(
                              (sum, item) => sum + (item.amount || 0),
                              0
                            )
                          )}
                          đ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Adjustments & Total */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="space-y-2 text-sm">
                {bill.late_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí trễ hạn:</span>
                    <span className="font-semibold text-red-600">
                      +{formatCurrency(bill.late_fee)}đ
                    </span>
                  </div>
                )}
                {bill.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-semibold text-green-600">
                      -{formatCurrency(bill.discount_amount)}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-bold text-gray-900">
                    Tổng thanh toán:
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatCurrency(bill.total_amount)}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2 text-sm">
                  📌 Ghi chú
                </h3>
                <p className="text-sm text-gray-700">{bill.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        {bill.payments && bill.payments.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">
              💰 Lịch sử thanh toán ({bill.payments.length} lần)
            </h3>
            <div className="space-y-2">
              {bill.payments.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="bg-white p-3 rounded border border-green-200 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(payment.payment_date)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {payment.method || "Chưa rõ"} - {payment.reference || ""}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-gray-500 italic">
                        {payment.note}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}đ
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BillViewModal;


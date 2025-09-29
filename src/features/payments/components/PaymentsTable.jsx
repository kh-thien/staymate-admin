
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PaymentsTable = ({
  payments,
  onView,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const getPaymentMethodIcon = (method) => {
    const iconClasses = "h-5 w-5";

    switch (method) {
      case "CASH":
        return <BanknotesIcon className={`${iconClasses} text-green-500`} />;
      case "BANK_TRANSFER":
        return <ArrowPathIcon className={`${iconClasses} text-blue-500`} />;
      case "CARD":
        return <CreditCardIcon className={`${iconClasses} text-purple-500`} />;
      default:
        return (
          <CurrencyDollarIcon className={`${iconClasses} text-gray-500`} />
        );
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methodLabels = {
      CASH: "Tiền mặt",
      BANK_TRANSFER: "Chuyển khoản",
      CARD: "Thẻ",
      OTHER: "Khác",
    };
    return methodLabels[method] || method;
  };

  const getPaymentMethodColor = (method) => {
    const colorClasses = {
      CASH: "bg-green-100 text-green-800",
      BANK_TRANSFER: "bg-blue-100 text-blue-800",
      CARD: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[method] || colorClasses.OTHER;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách thanh toán ({payments.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hóa đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người thuê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương thức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tham chiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày thanh toán
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment, index) => (
              <tr
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.bills?.bill_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.bills?.contracts?.rooms?.code} -{" "}
                      {payment.bills?.contracts?.rooms?.properties?.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.bills?.contracts?.tenants?.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.bills?.contracts?.tenants?.phone}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.amount?.toLocaleString()} VNĐ
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      {getPaymentMethodIcon(payment.method)}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                        payment.method
                      )}`}
                    >
                      {getPaymentMethodLabel(payment.method)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.reference || "N/A"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(payment.payment_date), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(payment.payment_date), "HH:mm", {
                      locale: vi,
                    })}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(payment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(payment)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(payment)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length === 0 && !loading && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có thanh toán
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo thanh toán mới.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;

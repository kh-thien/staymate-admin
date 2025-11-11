import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import bankData from "../data/bank_acqid.json";

const PaymentAccountsManager = ({ isOpen, onClose, onRefresh }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
    account_number: "",
    account_holder: "",
    branch: "",
  });
  const [errors, setErrors] = useState({});

  // Load accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { paymentService } = await import("../services/paymentService");
      const data = await paymentService.getAllPaymentAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bank_code: "",
      bank_name: "",
      account_number: "",
      account_holder: "",
      branch: "",
    });
    setErrors({});
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleBankSelect = (e) => {
    const selectedBank = bankData.data.find(
      (bank) => bank.code === e.target.value
    );
    if (selectedBank) {
      setFormData((prev) => ({
        ...prev,
        bank_code: selectedBank.code,
        bank_name: selectedBank.shortName,
        acq_id: selectedBank.bin, // Save acqId (bin)
      }));
      if (errors.bank_code) {
        setErrors((prev) => ({ ...prev, bank_code: "" }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.bank_code) {
      newErrors.bank_code = "Vui lòng chọn ngân hàng";
    }

    if (!formData.account_number) {
      newErrors.account_number = "Vui lòng nhập số tài khoản";
    } else if (!/^\d+$/.test(formData.account_number)) {
      newErrors.account_number = "Số tài khoản chỉ được chứa số";
    } else if (
      formData.account_number.length < 6 ||
      formData.account_number.length > 20
    ) {
      newErrors.account_number = "Số tài khoản phải từ 6-20 chữ số";
    }

    if (!formData.account_holder) {
      newErrors.account_holder = "Vui lòng nhập tên chủ tài khoản";
    } else if (formData.account_holder.length < 2) {
      newErrors.account_holder = "Tên chủ tài khoản quá ngắn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const { paymentService } = await import("../services/paymentService");
      await paymentService.savePaymentAccount(formData);
      await loadAccounts();
      resetForm();
      if (onRefresh) onRefresh();
      alert("✅ Đã lưu tài khoản thành công!");
    } catch (error) {
      console.error("Error saving account:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      id: account.id, // Add ID for update
      bank_code: account.bank_code,
      bank_name: account.bank_name,
      acq_id: account.acq_id,
      account_number: account.account_number,
      account_holder: account.account_holder,
      branch: account.branch || "",
    });
    setShowForm(true);
  };

  const handleSetDefault = async (accountId) => {
    if (!window.confirm("Đặt tài khoản này làm mặc định?")) return;

    setLoading(true);
    try {
      const { paymentService } = await import("../services/paymentService");
      await paymentService.setDefaultPaymentAccount(accountId);
      await loadAccounts();
      if (onRefresh) onRefresh();
      alert("✅ Đã đặt làm tài khoản mặc định!");
    } catch (error) {
      console.error("Error setting default:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId, isDefault) => {
    if (isDefault) {
      alert("❌ Không thể xóa tài khoản mặc định!");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    setLoading(true);
    try {
      const { paymentService } = await import("../services/paymentService");
      await paymentService.deletePaymentAccount(accountId);
      await loadAccounts();
      if (onRefresh) onRefresh();
      alert("✅ Đã xóa tài khoản!");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BuildingLibraryIcon className="h-6 w-6 text-white mr-3" />
                <h3 className="text-xl font-semibold text-white">
                  Quản lý tài khoản thanh toán
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Add button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mb-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm tài khoản mới
              </button>
            )}

            {/* Add/Edit Form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editingAccount
                      ? "Chỉnh sửa tài khoản"
                      : "Thêm tài khoản mới"}
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Bank Select */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngân hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bank_code}
                      onChange={handleBankSelect}
                      className={`w-full px-4 py-3 border ${
                        errors.bank_code ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Chọn ngân hàng</option>
                      {bankData.data.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.shortName} - {bank.name}
                        </option>
                      ))}
                    </select>
                    {errors.bank_code && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bank_code}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      placeholder="VD: 1234567890"
                      className={`w-full px-4 py-3 border ${
                        errors.account_number
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.account_number && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.account_number}
                      </p>
                    )}
                  </div>

                  {/* Account Holder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="account_holder"
                      value={formData.account_holder}
                      onChange={handleChange}
                      placeholder="NGUYEN VAN A"
                      className={`w-full px-4 py-3 border ${
                        errors.account_holder
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.account_holder && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.account_holder}
                      </p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chi nhánh (tùy chọn)
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="VD: Chi nhánh Hà Nội"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            )}

            {/* Accounts List */}
            <div className="space-y-3">
              {loading && accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Đang tải...
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có tài khoản nào. Hãy thêm tài khoản đầu tiên!
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 border-2 rounded-lg ${
                      account.is_default
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <BuildingLibraryIcon className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-semibold text-gray-900">
                            {account.bank_name}
                          </span>
                          {account.is_default && (
                            <span className="ml-2 flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircleSolidIcon className="h-4 w-4 mr-1" />
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Số TK:</strong> {account.account_number}
                          </p>
                          <p>
                            <strong>Chủ TK:</strong> {account.account_holder}
                          </p>
                          {account.branch && (
                            <p>
                              <strong>Chi nhánh:</strong> {account.branch}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleSetDefault(account.id)}
                          disabled={loading || account.is_default}
                          className={`p-2 rounded-lg transition-colors ${
                            account.is_default
                              ? "text-yellow-500 cursor-default"
                              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                          }`}
                          title={
                            account.is_default
                              ? "Tài khoản mặc định"
                              : "Đặt làm mặc định"
                          }
                        >
                          {account.is_default ? (
                            <StarSolidIcon className="h-5 w-5" />
                          ) : (
                            <StarIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(account)}
                          disabled={loading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(account.id, account.is_default)
                          }
                          disabled={loading || account.is_default}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            account.is_default
                              ? "Không thể xóa tài khoản mặc định"
                              : "Xóa"
                          }
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAccountsManager;

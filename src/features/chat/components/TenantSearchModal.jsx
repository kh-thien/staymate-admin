import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TenantSearchModal = ({ isOpen, onClose, onSelectTenant }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for now - will be replaced with actual API call
  const mockTenants = [
    {
      id: "1",
      fullname: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      account_status: "ACTIVE",
      user_id: "user-1",
      rooms: {
        code: "A101",
        name: "Phòng A101",
        properties: {
          name: "Chung cư ABC",
          address: "123 Đường ABC, Quận 1, TP.HCM",
        },
      },
    },
    {
      id: "2",
      fullname: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      account_status: "ACTIVE",
      user_id: "user-2",
      rooms: {
        code: "B202",
        name: "Phòng B202",
        properties: {
          name: "Chung cư XYZ",
          address: "456 Đường XYZ, Quận 2, TP.HCM",
        },
      },
    },
  ];

  // Search tenants
  const searchTenants = async (term) => {
    if (!term || !term.trim()) {
      setTenants([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const filtered = mockTenants.filter(
        (tenant) =>
          tenant.fullname.toLowerCase().includes(term.toLowerCase()) ||
          tenant.email.toLowerCase().includes(term.toLowerCase()) ||
          tenant.phone.includes(term)
      );

      setTenants(filtered);
    } catch (err) {
      console.error("Error searching tenants:", err);
      setError("Lỗi khi tìm kiếm người thuê");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTenants(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setTenants([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Tìm kiếm người thuê
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {searchTerm
                  ? "Không tìm thấy người thuê nào"
                  : "Nhập từ khóa để tìm kiếm"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  onClick={() => onSelectTenant(tenant)}
                  className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                      {tenant.fullname.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {tenant.fullname}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {tenant.account_status === "ACTIVE"
                            ? "Hoạt động"
                            : tenant.account_status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">
                            {tenant.rooms?.code}
                          </span>{" "}
                          • {tenant.rooms?.properties?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500 text-center">
            Chọn một người thuê để bắt đầu cuộc trò chuyện
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantSearchModal;

import React, { useState, useEffect } from "react";
import { tenantService } from "../../tenants/services/tenantService";
import { useAuth } from "../../auth/context/useAuth";

const TenantSelector = ({ onSelectTenant, selectedTenant, onClear }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch tenants based on search
  useEffect(() => {
    const searchTenants = async () => {
      if (searchTerm.length < 2 || selectedTenant) {
        setTenants([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        // Search tenants - RLS sẽ tự động filter theo user và properties của họ
        // Chỉ hiển thị: tenants mà user tạo, tenants chưa có phòng, hoặc tenants trong properties của user
        const data = await tenantService.searchTenants(searchTerm);
        setTenants(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching tenants:", error);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchTenants, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTenant]);

  const handleSelectTenant = (tenant) => {
    onSelectTenant(tenant);
    setSearchTerm(`${tenant.fullname} - ${tenant.phone}`);
    setShowDropdown(false);
    setTenants([]); // Clear search results
  };

  const handleClear = () => {
    setSearchTerm("");
    setTenants([]);
    setShowDropdown(false);
    onClear();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm người thuê hiện có
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => !selectedTenant && setShowDropdown(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm theo tên, SĐT hoặc CCCD..."
              disabled={!!selectedTenant}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        {selectedTenant && (
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && !selectedTenant && tenants.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => handleSelectTenant(tenant)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {tenant.fullname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tenant.fullname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tenant.phone}
                    {tenant.email && ` • ${tenant.email}`}
                  </p>
                  {tenant.id_number && (
                    <p className="text-xs text-gray-400">
                      CCCD: {tenant.id_number}
                    </p>
                  )}
                  {tenant.rooms && (
                    <p className="text-xs text-blue-600">
                      Phòng: {tenant.rooms.code}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.active_in_room
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tenant.active_in_room ? "Đang ở" : "Chưa có phòng"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Tenant Display */}
      {selectedTenant && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {selectedTenant.fullname.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {selectedTenant.fullname}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedTenant.phone}
                {selectedTenant.email && ` • ${selectedTenant.email}`}
              </p>
              {selectedTenant.occupation && (
                <p className="text-xs text-gray-500">
                  {selectedTenant.occupation}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Đã chọn
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown &&
        !selectedTenant &&
        searchTerm.length >= 2 &&
        tenants.length === 0 &&
        !loading && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              Không tìm thấy người thuê phù hợp
            </p>
          </div>
        )}
    </div>
  );
};

export default TenantSelector;

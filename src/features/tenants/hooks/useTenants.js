import { useState, useEffect, useCallback, useMemo } from "react";
import { tenantService } from "../services/tenantService";
import { useAuth } from "../../auth/context/useAuth";

export const useTenants = (filters = {}) => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize filters để tránh re-create function mỗi lần render
  const memoizedFilters = useMemo(() => filters, [
    filters?.search,
    filters?.status,
    filters?.room,
    filters?.property,
    filters?.sortBy,
    filters?.sortOrder,
  ]);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        setTenants([]);
        setLoading(false);
        return;
      }
      const data = await tenantService.getTenants({
        ...memoizedFilters,
        created_by: user.id,
      });
      setTenants(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters, user?.id]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (tenantData) => {
    try {
      if (!user) throw new Error("User not authenticated");
      const newTenant = await tenantService.createTenant({
        ...tenantData,
        created_by: user.id,
      });
      setTenants((prev) => [newTenant, ...prev]);
      return newTenant;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    try {
      const updatedTenant = await tenantService.updateTenant(
        tenantId,
        updateData
      );
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === tenantId ? updatedTenant : tenant))
      );
      return updatedTenant;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTenant = async (tenantId) => {
    try {
      // Kiểm tra điều kiện xóa trước
      const canDelete = await tenantService.canDeleteTenant(tenantId);

      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      await tenantService.deleteTenant(tenantId);
      // Refresh data instead of just updating state
      await fetchTenants();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const permanentDeleteTenant = async (tenantId) => {
    try {
      await tenantService.permanentDeleteTenant(tenantId);
      setTenants((prev) => prev.filter((tenant) => tenant.id !== tenantId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshTenants = async () => {
    await fetchTenants();
  };

  const searchTenants = async (searchTerm) => {
    try {
      setLoading(true);
      const data = await tenantService.searchTenants(searchTerm);
      setTenants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTenantStats = useCallback(async () => {
    try {
      if (!user) return { total: 0, active: 0, inactive: 0 };
      return await tenantService.getTenantStats({ created_by: user.id });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.id]);

  const getTenantsMovingOut = async (days = 30) => {
    try {
      return await tenantService.getTenantsMovingOut(days);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getNewTenants = async () => {
    try {
      return await tenantService.getNewTenants();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const exportTenants = async (exportFilters = {}) => {
    try {
      return await tenantService.exportTenants(exportFilters);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    tenants,
    loading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
    permanentDeleteTenant,
    refreshTenants,
    searchTenants,
    getTenantStats,
    getTenantsMovingOut,
    getNewTenants,
    exportTenants,
  };
};

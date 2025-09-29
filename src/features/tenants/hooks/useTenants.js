import { useState, useEffect, useCallback } from "react";
import { tenantService } from "../services/tenantService";

export const useTenants = (filters = {}) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getTenants(filters);
      setTenants(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.room,
    filters.property,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (tenantData) => {
    try {
      const newTenant = await tenantService.createTenant(tenantData);
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

  const getTenantStats = async () => {
    try {
      return await tenantService.getTenantStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

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

import { useState, useEffect, useCallback } from "react";
import { tenantService } from "../services/tenantService";

export const useTenant = (tenantId) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenant = useCallback(async () => {
    if (!tenantId) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getTenantById(tenantId);
      setTenant(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tenant:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const updateTenant = async (updateData) => {
    if (!tenantId) return;

    try {
      const updatedTenant = await tenantService.updateTenant(
        tenantId,
        updateData
      );
      setTenant(updatedTenant);
      return updatedTenant;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTenant = async () => {
    if (!tenantId) return;

    try {
      await tenantService.deleteTenant(tenantId);
      setTenant((prev) =>
        prev
          ? {
              ...prev,
              is_active: false,
              move_out_date: new Date().toISOString().split("T")[0],
            }
          : null
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const permanentDeleteTenant = async () => {
    if (!tenantId) return;

    try {
      await tenantService.permanentDeleteTenant(tenantId);
      setTenant(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshTenant = async () => {
    await fetchTenant();
  };

  return {
    tenant,
    loading,
    error,
    updateTenant,
    deleteTenant,
    permanentDeleteTenant,
    refreshTenant,
  };
};

import { useState, useEffect } from "react";
import { maintenanceService } from "../services/maintenanceService";
import { supabase } from "../../../core/data/remote/supabase";

export const useMaintenance = (filters = {}) => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalCost: 0,
    byType: {
      BUILDING: 0,
      ROOM: 0,
      OTHER: 0,
    },
  });

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestsData, statsData] = await Promise.all([
        maintenanceService.getMaintenanceRequests(filters),
        maintenanceService.getMaintenanceStats(),
      ]);

      setMaintenanceRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createMaintenanceRequest = async (requestData) => {
    try {
      const newRequest = await maintenanceService.createMaintenanceRequest(
        requestData
      );
      setMaintenanceRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      throw error;
    }
  };

  const updateMaintenanceRequest = async (id, requestData) => {
    try {
      const updatedRequest = await maintenanceService.updateMaintenanceRequest(
        id,
        requestData
      );
      setMaintenanceRequests((prev) =>
        prev.map((request) => (request.id === id ? updatedRequest : request))
      );
      return updatedRequest;
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      throw error;
    }
  };

  const deleteMaintenanceRequest = async (id) => {
    try {
      await maintenanceService.deleteMaintenanceRequest(id);
      setMaintenanceRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );
      return true;
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      throw error;
    }
  };

  const updateMaintenanceStatus = async (id, status, additionalData = {}) => {
    // 🚀 OPTIMISTIC UPDATE: Update UI immediately
    setMaintenanceRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, status, updated_at: new Date().toISOString() }
          : request
      )
    );

    try {
      // Call API in background
      const updatedRequest = await maintenanceService.updateMaintenanceStatus(
        id,
        status,
        additionalData
      );

      // Update with full data from server (includes relationships)
      setMaintenanceRequests((prev) =>
        prev.map((request) => (request.id === id ? updatedRequest : request))
      );

      return updatedRequest;
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      // Revert optimistic update on error by refetching
      fetchMaintenanceRequests();
      throw error;
    }
  };

  const refreshMaintenanceRequests = () => {
    fetchMaintenanceRequests();
  };

  useEffect(() => {
    fetchMaintenanceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // 🔥 REALTIME SUBSCRIPTION
  useEffect(() => {
    let refetchTimeout;
    let insertRefetchTimeout;

    // Debounced refetch to avoid multiple refetches in quick succession
    const debouncedRefetch = () => {
      clearTimeout(refetchTimeout);
      refetchTimeout = setTimeout(() => {
        fetchMaintenanceRequests();
      }, 300); // Reduced from 500ms to 300ms for faster updates
    };

    // Faster refetch for INSERT events (no debounce, immediate refresh)
    const immediateRefetchForInsert = () => {
      clearTimeout(insertRefetchTimeout);
      // Small delay to ensure database transaction is committed
      insertRefetchTimeout = setTimeout(() => {
        fetchMaintenanceRequests();
      }, 100);
    };

    const channel = supabase
      .channel("maintenance-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "maintenance",
        },
        (payload) => {
          // 📍 PUSH NOTIFICATION TRIGGER POINT - INSERT
          // TODO: Implement push notification for new maintenance
          console.log("🔔 REALTIME: New maintenance created", payload.new.id);

          // Immediate refresh for INSERT events (faster than UPDATE)
          immediateRefetchForInsert();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "maintenance",
        },
        (payload) => {
          // 📍 PUSH NOTIFICATION TRIGGER POINT - UPDATE
          // TODO: Implement push notification for maintenance status change
          console.log("🔔 REALTIME: Maintenance updated", payload.new.id);

          // 🚀 OPTIMISTIC: Update state immediately for better UX
          setMaintenanceRequests((prev) =>
            prev.map((request) =>
              request.id === payload.new.id
                ? { ...request, ...payload.new }
                : request
            )
          );

          // Still fetch to get full data with relationships (debounced)
          debouncedRefetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "maintenance",
        },
        (payload) => {
          // 📍 PUSH NOTIFICATION TRIGGER POINT - DELETE
          console.log("� REALTIME: Maintenance deleted", payload.old.id);

          setMaintenanceRequests((prev) =>
            prev.filter((request) => request.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Maintenance realtime connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Maintenance realtime error");
        }
      });

    return () => {
      clearTimeout(refetchTimeout);
      clearTimeout(insertRefetchTimeout);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only setup once

  return {
    maintenanceRequests,
    loading,
    error,
    stats,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    updateMaintenanceStatus,
    refreshMaintenanceRequests,
  };
};

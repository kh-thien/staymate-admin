import { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";
import { maintenanceService } from "../services/maintenanceService";

/**
 * Hook to fetch and manage PENDING maintenance requests
 * for properties owned by the current user
 */
export const usePendingMaintenance = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's properties
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      // Get user's properties
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      if (propError) throw propError;

      if (!properties || properties.length === 0) {
        setPendingRequests([]);
        setLoading(false);
        return;
      }

      const propertyIds = properties.map((p) => p.id);

      // Fetch PENDING maintenance requests for these properties
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .select(
          `
          *,
          properties:properties_id (
            id,
            name,
            address
          ),
          rooms:room_id (
            id,
            name
          )
        `
        )
        .eq("maintenance_requests_status", "PENDING")
        .in("properties_id", propertyIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Fetch tenant information for each request
      const requestsWithTenants = await Promise.all(
        (maintenanceData || []).map(async (request) => {
          if (!request.reported_by) return { ...request, tenant: null };

          // Find tenant by user_id
          const { data: tenant, error: tenantError } = await supabase
            .from("tenants")
            .select("*")
            .eq("user_id", request.reported_by)
            .is("deleted_at", null)
            .single();

          if (tenantError && tenantError.code !== "PGRST116") {
            console.error("Error fetching tenant:", tenantError);
          }

          return {
            ...request,
            tenant: tenant || null,
          };
        })
      );

      setPendingRequests(requestsWithTenants);
    } catch (error) {
      console.error("Error fetching pending maintenance requests:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve a pending request → Create maintenance record
  const approveRequest = async (id, additionalData = {}) => {
    try {
      await maintenanceService.approveMaintenanceRequest(id, additionalData);
      // Refresh list after approval
      fetchPendingRequests();
    } catch (error) {
      console.error("Error approving maintenance request:", error);
      throw error;
    }
  };

  // Reject a pending request
  const rejectRequest = async (id) => {
    try {
      await maintenanceService.rejectMaintenanceRequest(id);
      // Refresh list after rejection
      fetchPendingRequests();
    } catch (error) {
      console.error("Error rejecting maintenance request:", error);
      throw error;
    }
  };

  // Cancel a pending request
  const cancelRequest = async (id) => {
    try {
      await maintenanceService.cancelMaintenanceRequest(id);
      // Refresh list after cancellation
      fetchPendingRequests();
    } catch (error) {
      console.error("Error cancelling maintenance request:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // 🔥 REALTIME SUBSCRIPTION for PENDING requests only
  useEffect(() => {
    let refetchTimeout;

    const debouncedRefetch = () => {
      clearTimeout(refetchTimeout);
      refetchTimeout = setTimeout(() => {
        fetchPendingRequests();
      }, 500);
    };

    const channel = supabase
      .channel("pending-maintenance-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "maintenance_requests",
          filter: "maintenance_requests_status=eq.PENDING",
        },
        (payload) => {
          console.log(
            "🔔 PENDING: New maintenance request created",
            payload.new.id
          );
          debouncedRefetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "maintenance_requests",
        },
        (payload) => {
          console.log(
            "🔔 PENDING: Maintenance request updated",
            payload.new.id
          );
          debouncedRefetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "maintenance_requests",
        },
        (payload) => {
          console.log(
            "🔔 PENDING: Maintenance request deleted",
            payload.old.id
          );
          setPendingRequests((prev) =>
            prev.filter((request) => request.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Pending maintenance requests realtime connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Pending maintenance requests realtime error");
        }
      });

    return () => {
      clearTimeout(refetchTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pendingRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
    cancelRequest,
    refreshPendingRequests: fetchPendingRequests,
  };
};

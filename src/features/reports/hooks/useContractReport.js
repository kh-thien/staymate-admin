import { useState, useEffect, useRef, useCallback } from "react";
import { reportService } from "../services/reportService";
import { supabase } from "../../../core/data/remote/supabase";

export const useContractReport = (propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const isMounted = useRef(true);
  const isFetchingRef = useRef(false);

  // Memoize fetchData với useCallback để tránh re-create mỗi render
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      if (!isMounted.current) return;
      
      setLoading(true);
      setError(null);

      // Get contract summary data
      const summaryData = await reportService.getContractSummary(
        propertyId,
        periodType,
        limit,
        dateFilter
      );

      if (!isMounted.current) return;
      setData(summaryData || []);

      // Get expiring contracts
      const expiring = await reportService.getExpiringContracts(propertyId, 90);
      if (!isMounted.current) return;
      setExpiringContracts(expiring || []);
    } catch (err) {
      console.error("Error fetching contract report:", err);
      if (!isMounted.current) return;
      setError(err);
      setData([]);
      setExpiringContracts([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [propertyId, periodType, limit, dateFilter]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // 🔥 REALTIME SUBSCRIPTION - Tự động refresh khi có thay đổi
  useEffect(() => {
    let refetchTimeout;
    let isMounted = true;

    // Debounced refetch để tránh nhiều lần fetch liên tiếp
    const debouncedRefetch = () => {
      if (!isMounted) return;
      
      clearTimeout(refetchTimeout);
      refetchTimeout = setTimeout(async () => {
        if (!isMounted) return;
        fetchData();
      }, 2000); // Đợi 2 giây để tránh fetch quá nhiều lần
    };

    console.log("🔔 Setting up realtime subscription for contract report");

    const channelName = propertyId 
      ? `contract-report-${propertyId}`
      : `contract-report-all-properties`;
    
    const channel = supabase.channel(channelName);

    // Subscribe to contracts changes
    if (propertyId) {
      // For specific property, we need to filter by rooms
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contracts",
          },
          (payload) => {
            console.log("🔔 REALTIME: Contract changed, refreshing contract report");
            debouncedRefetch();
          }
        );
    } else {
      // For all properties, listen to all contracts
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contracts",
          },
          (payload) => {
            console.log("🔔 REALTIME: Contract changed (all properties), refreshing contract report");
            debouncedRefetch();
          }
        );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Contract report realtime connected");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Contract report realtime error");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("🔴 Cleaning up contract report realtime subscription");
      isMounted = false;
      clearTimeout(refetchTimeout);
      supabase.removeChannel(channel);
    };
  }, [propertyId, fetchData]);

  return {
    data,
    loading,
    error,
    expiringContracts,
    refetch: fetchData,
  };
};


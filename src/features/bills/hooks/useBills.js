import { useState, useEffect } from "react";
import { billService } from "../services/billService";
import { supabase } from "../../../core/data/remote/supabase";

export const useBills = (filters = {}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    totalRevenue: 0,
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const [billsData, statsData] = await Promise.all([
        billService.getBills(filters),
        billService.getBillStats(),
      ]);

      setBills(billsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createBill = async (billData) => {
    try {
      const newBill = await billService.createBill(billData);
      setBills((prev) => [newBill, ...prev]);
      return newBill;
    } catch (error) {
      console.error("Error creating bill:", error);
      throw error;
    }
  };

  const updateBill = async (id, billData) => {
    try {
      const updatedBill = await billService.updateBill(id, billData);
      setBills((prev) =>
        prev.map((bill) => (bill.id === id ? updatedBill : bill))
      );
      return updatedBill;
    } catch (error) {
      console.error("Error updating bill:", error);
      throw error;
    }
  };

  const deleteBill = async (id) => {
    try {
      await billService.deleteBill(id);
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting bill:", error);
      throw error;
    }
  };

  const refreshBills = () => {
    fetchBills();
  };

  // Initial fetch
  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Realtime subscription (matching chat pattern)
  useEffect(() => {
    const isDev = import.meta.env.DEV;

    if (isDev) {
      console.log("🔔 Setting up realtime subscription for bills...");
    }

    const channel = supabase
      .channel("bills-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("➕ REALTIME: New bill created:", payload.new);
          // Refresh to get full data with relationships
          fetchBills();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("✏️ REALTIME: Bill updated:", payload.new);
          // Refresh to get full data with relationships
          fetchBills();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("🗑️ REALTIME: Bill deleted:", payload.old);
          setBills((prev) => prev.filter((bill) => bill.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("📡 REALTIME Subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Bills realtime: SUBSCRIBED and ready to receive events!"
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ Bills realtime CHANNEL_ERROR - check Supabase Dashboard"
          );
        } else if (status === "TIMED_OUT") {
          console.error("⏱️ Bills realtime TIMED_OUT");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      if (isDev) {
        console.log("🔕 Cleaning up bills realtime subscription");
      }
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only setup once

  return {
    bills,
    loading,
    error,
    stats,
    createBill,
    updateBill,
    deleteBill,
    refreshBills,
  };
};

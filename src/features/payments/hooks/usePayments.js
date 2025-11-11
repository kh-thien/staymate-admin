import { useState, useEffect, useCallback, useRef } from "react";
import { paymentService } from "../services/paymentService";
import { supabase } from "../../../core/data/remote/supabase";

export const usePayments = (filters = {}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    cash: 0,
    bankTransfer: 0,
    card: 0,
  });

  // Use ref to store latest filters without causing re-renders
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsData, statsData] = await Promise.all([
        paymentService.getPayments(filtersRef.current),
        paymentService.getPaymentStats(),
      ]);

      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (paymentData) => {
    try {
      const newPayment = await paymentService.createPayment(paymentData);
      setPayments((prev) => [newPayment, ...prev]);
      return newPayment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  const updatePayment = async (id, paymentData) => {
    try {
      const result = await paymentService.updatePayment(id, paymentData);
      // Sau khi update, luôn fetch lại payment đầy đủ quan hệ
      // Note: Realtime subscription sẽ tự động update UI, nhưng chúng ta vẫn return data để UI có thể update ngay lập tức
      const fullPayment = await paymentService.getPaymentById(id);
      // Optimistically update payment in state
      // Realtime subscription will also trigger and update, but this ensures immediate UI update
      setPayments((prev) =>
        prev.map((payment) => (payment.id === id ? fullPayment : payment))
      );
      return fullPayment;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  const deletePayment = async (id) => {
    try {
      await paymentService.deletePayment(id);
      setPayments((prev) => prev.filter((payment) => payment.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  };

  const refreshPayments = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.method,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Realtime subscription - only setup once, never cleanup unless component unmounts
  useEffect(() => {
    console.log("🔴 Setting up realtime subscription for payments");

    const channel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        async (payload) => {
          console.log("🔔 Payment change detected:", payload);

          switch (payload.eventType) {
            case "INSERT": {
              // Fetch full payment data with relations for new payment
              try {
                const payment = await paymentService.getPaymentById(payload.new.id);
                if (payment) {
                  setPayments((prev) => {
                    // Check if payment already exists (avoid duplicates)
                    const exists = prev.some((p) => p.id === payment.id);
                    if (!exists) {
                      // Apply filters to check if payment should be shown
                      const filters = filtersRef.current;
                      let shouldInclude = true;

                      if (filters.method && filters.method !== "all") {
                        shouldInclude = shouldInclude && payment.method === filters.method;
                      }
                      if (filters.status && filters.status !== "all") {
                        shouldInclude = shouldInclude && payment.payment_status === filters.status;
                      }
                      if (filters.search) {
                        const searchLower = filters.search.toLowerCase();
                        shouldInclude =
                          shouldInclude &&
                          (payment.reference?.toLowerCase().includes(searchLower) ||
                            payment.bills?.bill_number?.toLowerCase().includes(searchLower) ||
                            payment.bills?.contracts?.tenants?.fullname?.toLowerCase().includes(searchLower));
                      }

                      if (shouldInclude) {
                        return [payment, ...prev];
                      }
                    }
                    return prev;
                  });
                  // Refresh stats
                  paymentService.getPaymentStats().then(setStats);
                }
              } catch (error) {
                console.error("Error fetching payment in realtime INSERT:", error);
              }
              break;
            }
            case "UPDATE": {
              // Fetch full payment data with relations for updated payment
              try {
                const payment = await paymentService.getPaymentById(payload.new.id);
                if (payment) {
                  setPayments((prev) => {
                    const exists = prev.some((p) => p.id === payment.id);
                    if (exists) {
                      // Payment exists in list, always update it
                      // Note: We update regardless of filters to ensure UI consistency
                      // Filters will be applied when user changes them
                      return prev.map((p) => (p.id === payment.id ? payment : p));
                    } else {
                      // Payment doesn't exist in list, check if it should be added based on filters
                      const filters = filtersRef.current;
                      let shouldInclude = true;

                      if (filters.method && filters.method !== "all") {
                        shouldInclude = shouldInclude && payment.method === filters.method;
                      }
                      if (filters.status && filters.status !== "all") {
                        shouldInclude = shouldInclude && payment.payment_status === filters.status;
                      }
                      if (filters.search) {
                        const searchLower = filters.search.toLowerCase();
                        shouldInclude =
                          shouldInclude &&
                          (payment.reference?.toLowerCase().includes(searchLower) ||
                            payment.bills?.bill_number?.toLowerCase().includes(searchLower) ||
                            payment.bills?.contracts?.tenants?.fullname?.toLowerCase().includes(searchLower));
                      }

                      if (shouldInclude) {
                        return [payment, ...prev];
                      }
                    }
                    return prev;
                  });
                  // Refresh stats
                  paymentService.getPaymentStats().then(setStats);
                }
              } catch (error) {
                console.error("Error fetching payment in realtime UPDATE:", error);
                // On error, refetch all payments to ensure consistency
                fetchPayments();
              }
              break;
            }
            case "DELETE":
              setPayments((prev) =>
                prev.filter((p) => p.id !== payload.old.id)
              );
              paymentService.getPaymentStats().then(setStats);
              break;
            default:
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("💚 Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to payments changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to payments changes");
        }
      });

    return () => {
      console.log("🔴 Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Setup once on mount, use filtersRef to access latest filters

  return {
    payments,
    loading,
    error,
    stats,
    createPayment,
    updatePayment,
    deletePayment,
    refreshPayments,
  };
};

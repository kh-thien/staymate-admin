import { useState, useEffect } from "react";
import { paymentService } from "../services/paymentService";

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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsData, statsData] = await Promise.all([
        paymentService.getPayments(filters),
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
  };

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
      const updatedPayment = await paymentService.updatePayment(
        id,
        paymentData
      );
      setPayments((prev) =>
        prev.map((payment) => (payment.id === id ? updatedPayment : payment))
      );
      return updatedPayment;
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

  const refreshPayments = () => {
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, [JSON.stringify(filters)]);

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

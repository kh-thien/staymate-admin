import { useState, useEffect } from "react";
import { billService } from "../services/billService";

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

  useEffect(() => {
    fetchBills();
  }, [JSON.stringify(filters)]);

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

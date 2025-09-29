import { useState, useEffect } from "react";
import { maintenanceService } from "../services/maintenanceService";

export const useMaintenance = (filters = {}) => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalCost: 0,
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
    try {
      const updatedRequest = await maintenanceService.updateMaintenanceStatus(
        id,
        status,
        additionalData
      );
      setMaintenanceRequests((prev) =>
        prev.map((request) => (request.id === id ? updatedRequest : request))
      );
      return updatedRequest;
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      throw error;
    }
  };

  const refreshMaintenanceRequests = () => {
    fetchMaintenanceRequests();
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [JSON.stringify(filters)]);

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

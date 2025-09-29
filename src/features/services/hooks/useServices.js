import { useState, useEffect } from "react";
import { serviceService } from "../services/serviceService";

export const useServices = (filters = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    metered: 0,
    unmetered: 0,
    typeDistribution: {},
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesData, statsData] = await Promise.all([
        serviceService.getServices(filters),
        serviceService.getServiceStats(),
      ]);

      setServices(servicesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData) => {
    try {
      const newService = await serviceService.createService(serviceData);
      setServices((prev) => [newService, ...prev]);
      return newService;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const updatedService = await serviceService.updateService(
        id,
        serviceData
      );
      setServices((prev) =>
        prev.map((service) => (service.id === id ? updatedService : service))
      );
      return updatedService;
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  };

  const deleteService = async (id) => {
    try {
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  };

  const refreshServices = () => {
    fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, [JSON.stringify(filters)]);

  return {
    services,
    loading,
    error,
    stats,
    createService,
    updateService,
    deleteService,
    refreshServices,
  };
};

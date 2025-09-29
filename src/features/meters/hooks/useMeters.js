import { useState, useEffect } from "react";
import { meterService } from "../services/meterService";

export const useMeters = (filters = {}) => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    electricity: 0,
    water: 0,
    needingReading: 0,
  });

  const fetchMeters = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metersData, statsData] = await Promise.all([
        meterService.getMeters(filters),
        meterService.getMeterStats(),
      ]);

      setMeters(metersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching meters:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createMeter = async (meterData) => {
    try {
      const newMeter = await meterService.createMeter(meterData);
      setMeters((prev) => [newMeter, ...prev]);
      return newMeter;
    } catch (error) {
      console.error("Error creating meter:", error);
      throw error;
    }
  };

  const updateMeter = async (id, meterData) => {
    try {
      const updatedMeter = await meterService.updateMeter(id, meterData);
      setMeters((prev) =>
        prev.map((meter) => (meter.id === id ? updatedMeter : meter))
      );
      return updatedMeter;
    } catch (error) {
      console.error("Error updating meter:", error);
      throw error;
    }
  };

  const deleteMeter = async (id) => {
    try {
      await meterService.deleteMeter(id);
      setMeters((prev) => prev.filter((meter) => meter.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting meter:", error);
      throw error;
    }
  };

  const updateMeterReading = async (id, reading, readingDate) => {
    try {
      const updatedMeter = await meterService.updateMeterReading(
        id,
        reading,
        readingDate
      );
      setMeters((prev) =>
        prev.map((meter) => (meter.id === id ? updatedMeter : meter))
      );
      return updatedMeter;
    } catch (error) {
      console.error("Error updating meter reading:", error);
      throw error;
    }
  };

  const refreshMeters = () => {
    fetchMeters();
  };

  useEffect(() => {
    fetchMeters();
  }, [JSON.stringify(filters)]);

  return {
    meters,
    loading,
    error,
    stats,
    createMeter,
    updateMeter,
    deleteMeter,
    updateMeterReading,
    refreshMeters,
  };
};

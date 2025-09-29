import { useState, useEffect, useCallback } from "react";
import { propertyService } from "../services/propertyService";

export const useProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);
      const [propertyData, statsData] = await Promise.all([
        propertyService.getPropertyById(propertyId),
        propertyService.getPropertyStats(propertyId),
      ]);
      setProperty(propertyData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching property:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const refreshStats = async () => {
    if (!propertyId) return;

    try {
      const statsData = await propertyService.getPropertyStats(propertyId);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error("Error refreshing stats:", err);
    }
  };

  return {
    property,
    stats,
    loading,
    error,
    fetchProperty,
    refreshStats,
  };
};

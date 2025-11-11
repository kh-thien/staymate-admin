import { useState, useEffect } from "react";
import { reportService } from "../services/reportService";

export const useDashboardOverview = (propertyId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const overview = await reportService.getDashboardOverview(propertyId);
        setData(overview);
      } catch (err) {
        console.error("Error fetching dashboard overview:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const refresh = async () => {
    try {
      setLoading(true);
      const overview = await reportService.getDashboardOverview(propertyId);
      setData(overview);
    } catch (err) {
      console.error("Error refreshing dashboard overview:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
};

import { useState, useEffect, useCallback } from "react";
import { contractService } from "../services/contractService";

export const useContracts = (filters = {}) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContracts(filters);
      setContracts(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.room,
    filters.property,
    filters.search,
    filters.startDateFrom,
    filters.startDateTo,
    filters.endDateFrom,
    filters.endDateTo,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const createContract = async (contractData) => {
    try {
      const newContract = await contractService.createContract(contractData);
      setContracts((prev) => [newContract, ...prev]);
      return newContract;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateContract = async (contractId, updateData) => {
    try {
      const updatedContract = await contractService.updateContract(
        contractId,
        updateData
      );
      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId ? updatedContract : contract
        )
      );
      return updatedContract;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteContract = async (contractId) => {
    try {
      // Kiểm tra điều kiện xóa trước
      const canDelete = await contractService.canDeleteContract(contractId);

      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      await contractService.deleteContract(contractId);
      // Refresh data instead of just updating state
      await fetchContracts();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const terminateContract = async (contractId, terminationData = {}) => {
    try {
      const terminatedContract = await contractService.terminateContract(
        contractId,
        terminationData
      );
      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId ? terminatedContract : contract
        )
      );
      return terminatedContract;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const extendContract = async (contractId, extensionData) => {
    try {
      const extendedContract = await contractService.extendContract(
        contractId,
        extensionData
      );
      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId ? extendedContract : contract
        )
      );
      return extendedContract;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshContracts = async () => {
    await fetchContracts();
  };

  const getContractById = async (contractId) => {
    try {
      return await contractService.getContractById(contractId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getContractStats = async () => {
    try {
      return await contractService.getContractStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getExpiringContracts = async (days = 30) => {
    try {
      return await contractService.getExpiringContracts(days);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getNewContracts = async () => {
    try {
      return await contractService.getNewContracts();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const exportContracts = async (exportFilters = {}) => {
    try {
      return await contractService.exportContracts(exportFilters);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    contracts,
    loading,
    error,
    createContract,
    updateContract,
    deleteContract,
    terminateContract,
    extendContract,
    refreshContracts,
    getContractById,
    getContractStats,
    getExpiringContracts,
    getNewContracts,
    exportContracts,
  };
};

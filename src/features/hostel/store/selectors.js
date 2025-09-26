import { createSelector } from "@reduxjs/toolkit";

// Base selectors
const selectHostelState = (state) => state.hostel;
const selectRoomState = (state) => state.room;
const selectContractState = (state) => state.contract;

// Hostel selectors
export const selectHostels = createSelector(
  [selectHostelState],
  (hostel) => hostel.hostels
);

export const selectCurrentHostel = createSelector(
  [selectHostelState],
  (hostel) => hostel.currentHostel
);

export const selectHostelStats = createSelector(
  [selectHostelState],
  (hostel) => hostel.stats
);

export const selectHostelLoading = createSelector(
  [selectHostelState],
  (hostel) => hostel.isLoading
);

export const selectHostelCreating = createSelector(
  [selectHostelState],
  (hostel) => hostel.isCreating
);

export const selectHostelUpdating = createSelector(
  [selectHostelState],
  (hostel) => hostel.isUpdating
);

export const selectHostelDeleting = createSelector(
  [selectHostelState],
  (hostel) => hostel.isDeleting
);

export const selectHostelSearching = createSelector(
  [selectHostelState],
  (hostel) => hostel.isSearching
);

export const selectHostelError = createSelector(
  [selectHostelState],
  (hostel) => hostel.error
);

export const selectHostelFilters = createSelector(
  [selectHostelState],
  (hostel) => hostel.filters
);

export const selectHostelPagination = createSelector(
  [selectHostelState],
  (hostel) => hostel.pagination
);

// Room selectors
export const selectRooms = createSelector(
  [selectRoomState],
  (room) => room.rooms
);

export const selectCurrentRoom = createSelector(
  [selectRoomState],
  (room) => room.currentRoom
);

export const selectRoomStats = createSelector(
  [selectRoomState],
  (room) => room.stats
);

export const selectRoomLoading = createSelector(
  [selectRoomState],
  (room) => room.isLoading
);

export const selectRoomCreating = createSelector(
  [selectRoomState],
  (room) => room.isCreating
);

export const selectRoomUpdating = createSelector(
  [selectRoomState],
  (room) => room.isUpdating
);

export const selectRoomDeleting = createSelector(
  [selectRoomState],
  (room) => room.isDeleting
);

export const selectRoomSearching = createSelector(
  [selectRoomState],
  (room) => room.isSearching
);

export const selectRoomUpdatingOccupancy = createSelector(
  [selectRoomState],
  (room) => room.isUpdatingOccupancy
);

export const selectRoomUpdatingStatus = createSelector(
  [selectRoomState],
  (room) => room.isUpdatingStatus
);

export const selectRoomError = createSelector(
  [selectRoomState],
  (room) => room.error
);

export const selectRoomFilters = createSelector(
  [selectRoomState],
  (room) => room.filters
);

export const selectRoomPagination = createSelector(
  [selectRoomState],
  (room) => room.pagination
);

// Contract selectors
export const selectContracts = createSelector(
  [selectContractState],
  (contract) => contract.contracts
);

export const selectCurrentContract = createSelector(
  [selectContractState],
  (contract) => contract.currentContract
);

export const selectContractStats = createSelector(
  [selectContractState],
  (contract) => contract.stats
);

export const selectContractAvailability = createSelector(
  [selectContractState],
  (contract) => contract.availability
);

export const selectContractLoading = createSelector(
  [selectContractState],
  (contract) => contract.isLoading
);

export const selectContractCreating = createSelector(
  [selectContractState],
  (contract) => contract.isCreating
);

export const selectContractUpdating = createSelector(
  [selectContractState],
  (contract) => contract.isUpdating
);

export const selectContractDeleting = createSelector(
  [selectContractState],
  (contract) => contract.isDeleting
);

export const selectContractSearching = createSelector(
  [selectContractState],
  (contract) => contract.isSearching
);

export const selectContractUpdatingStatus = createSelector(
  [selectContractState],
  (contract) => contract.isUpdatingStatus
);

export const selectContractCheckingAvailability = createSelector(
  [selectContractState],
  (contract) => contract.isCheckingAvailability
);

export const selectContractError = createSelector(
  [selectContractState],
  (contract) => contract.error
);

export const selectContractFilters = createSelector(
  [selectContractState],
  (contract) => contract.filters
);

export const selectContractPagination = createSelector(
  [selectContractState],
  (contract) => contract.pagination
);

// Combined selectors for common use cases
export const selectHostelStatus = createSelector(
  [
    selectHostelLoading,
    selectHostelCreating,
    selectHostelUpdating,
    selectHostelDeleting,
  ],
  (isLoading, isCreating, isUpdating, isDeleting) => ({
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isCreating || isUpdating || isDeleting,
  })
);

export const selectRoomStatus = createSelector(
  [
    selectRoomLoading,
    selectRoomCreating,
    selectRoomUpdating,
    selectRoomDeleting,
  ],
  (isLoading, isCreating, isUpdating, isDeleting) => ({
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isCreating || isUpdating || isDeleting,
  })
);

export const selectContractStatus = createSelector(
  [
    selectContractLoading,
    selectContractCreating,
    selectContractUpdating,
    selectContractDeleting,
  ],
  (isLoading, isCreating, isUpdating, isDeleting) => ({
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isCreating || isUpdating || isDeleting,
  })
);

// Filtered data selectors
export const selectHostelsByStatus = createSelector(
  [selectHostels, (state, status) => status],
  (hostels, status) => {
    if (!status) return hostels;
    return hostels.filter((hostel) => hostel.status === status);
  }
);

export const selectRoomsByHostel = createSelector(
  [selectRooms, (state, hostelId) => hostelId],
  (rooms, hostelId) => {
    if (!hostelId) return rooms;
    return rooms.filter((room) => room.hostel_id === hostelId);
  }
);

export const selectRoomsByStatus = createSelector(
  [selectRooms, (state, status) => status],
  (rooms, status) => {
    if (!status) return rooms;
    return rooms.filter((room) => room.status === status);
  }
);

export const selectRoomsByType = createSelector(
  [selectRooms, (state, roomType) => roomType],
  (rooms, roomType) => {
    if (!roomType) return rooms;
    return rooms.filter((room) => room.room_type === roomType);
  }
);

export const selectContractsByRoom = createSelector(
  [selectContracts, (state, roomId) => roomId],
  (contracts, roomId) => {
    if (!roomId) return contracts;
    return contracts.filter((contract) => contract.room_id === roomId);
  }
);

export const selectContractsByStatus = createSelector(
  [selectContracts, (state, status) => status],
  (contracts, status) => {
    if (!status) return contracts;
    return contracts.filter((contract) => contract.status === status);
  }
);

export const selectActiveContracts = createSelector(
  [selectContracts],
  (contracts) => contracts.filter((contract) => contract.status === "active")
);

export const selectExpiringContracts = createSelector(
  [selectContracts],
  (contracts) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return contracts.filter((contract) => {
      if (contract.status !== "active") return false;
      const endDate = new Date(contract.end_date);
      return endDate <= thirtyDaysFromNow && endDate >= new Date();
    });
  }
);

export const selectOverdueContracts = createSelector(
  [selectContracts],
  (contracts) => {
    const today = new Date();
    return contracts.filter((contract) => {
      if (contract.status !== "active") return false;
      const endDate = new Date(contract.end_date);
      return endDate < today;
    });
  }
);

// Search and filter selectors
export const selectFilteredHostels = createSelector(
  [selectHostels, selectHostelFilters],
  (hostels, filters) => {
    return hostels.filter((hostel) => {
      if (filters.status && hostel.status !== filters.status) return false;
      if (
        filters.city &&
        !hostel.city.toLowerCase().includes(filters.city.toLowerCase())
      )
        return false;
      if (
        filters.state &&
        !hostel.state.toLowerCase().includes(filters.state.toLowerCase())
      )
        return false;
      if (
        filters.country &&
        !hostel.country.toLowerCase().includes(filters.country.toLowerCase())
      )
        return false;
      if (
        filters.search &&
        !hostel.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !hostel.address.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }
);

export const selectFilteredRooms = createSelector(
  [selectRooms, selectRoomFilters],
  (rooms, filters) => {
    return rooms.filter((room) => {
      if (filters.hostel_id && room.hostel_id !== filters.hostel_id)
        return false;
      if (filters.status && room.status !== filters.status) return false;
      if (filters.room_type && room.room_type !== filters.room_type)
        return false;
      if (filters.floor_number && room.floor_number !== filters.floor_number)
        return false;
      if (filters.min_price && room.base_price < filters.min_price)
        return false;
      if (filters.max_price && room.base_price > filters.max_price)
        return false;
      if (
        filters.min_area &&
        room.area_sqft &&
        room.area_sqft < filters.min_area
      )
        return false;
      if (
        filters.max_area &&
        room.area_sqft &&
        room.area_sqft > filters.max_area
      )
        return false;
      if (filters.max_occupancy && room.max_occupancy < filters.max_occupancy)
        return false;
      if (
        filters.search &&
        !room.room_number
          .toLowerCase()
          .includes(filters.search.toLowerCase()) &&
        !room.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }
);

export const selectFilteredContracts = createSelector(
  [selectContracts, selectContractFilters],
  (contracts, filters) => {
    return contracts.filter((contract) => {
      if (filters.room_id && contract.room_id !== filters.room_id) return false;
      if (filters.status && contract.status !== filters.status) return false;
      if (filters.tenant_id && contract.tenant_id !== filters.tenant_id)
        return false;
      if (filters.start_date && contract.start_date < filters.start_date)
        return false;
      if (filters.end_date && contract.end_date > filters.end_date)
        return false;
      if (
        filters.search &&
        !contract.tenant_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) &&
        !contract.tenant_email
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }
);

// Statistics selectors
export const selectHostelStatistics = createSelector(
  [selectHostels, selectHostelStats],
  (hostels, stats) => ({
    totalHostels: hostels.length,
    activeHostels: hostels.filter((h) => h.status === "active").length,
    inactiveHostels: hostels.filter((h) => h.status === "inactive").length,
    maintenanceHostels: hostels.filter((h) => h.status === "maintenance")
      .length,
    ...stats,
  })
);

export const selectRoomStatistics = createSelector(
  [selectRooms, selectRoomStats],
  (rooms, stats) => ({
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.status === "available").length,
    occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
    maintenanceRooms: rooms.filter((r) => r.status === "maintenance").length,
    reservedRooms: rooms.filter((r) => r.status === "reserved").length,
    ...stats,
  })
);

export const selectContractStatistics = createSelector(
  [selectContracts, selectContractStats],
  (contracts, stats) => ({
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c) => c.status === "active").length,
    expiredContracts: contracts.filter((c) => c.status === "expired").length,
    terminatedContracts: contracts.filter((c) => c.status === "terminated")
      .length,
    pendingContracts: contracts.filter((c) => c.status === "pending").length,
    ...stats,
  })
);

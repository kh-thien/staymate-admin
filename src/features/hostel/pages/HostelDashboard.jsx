/**
 * Hostel Dashboard - Main dashboard for hostel management
 * Demonstrates the complete hostel management system
 */

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import DashboardLayout from "../../../core/layout/DashboardLayout";
import {
  selectHostels,
  selectHostelLoading,
  selectHostelStats,
  selectRooms,
  selectRoomLoading,
  selectRoomStats,
  selectContracts,
  selectContractLoading,
  selectContractStats,
  selectHostelStatistics,
  selectRoomStatistics,
  selectContractStatistics,
} from "../store/selectors";
import {
  getHostels,
  getHostelStats,
  getRooms,
  getRoomStats,
  getContracts,
  getContractStats,
} from "../store";
import { DataTable, StatusBadge, SearchFilter } from "../components/shared";
import { HOSTEL_STATUS, ROOM_STATUS, CONTRACT_STATUS } from "../domain/types";

const HostelDashboard = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const hostels = useAppSelector(selectHostels);
  const hostelLoading = useAppSelector(selectHostelLoading);
  const hostelStats = useAppSelector(selectHostelStats);
  const rooms = useAppSelector(selectRooms);
  const roomLoading = useAppSelector(selectRoomLoading);
  const roomStats = useAppSelector(selectRoomStats);
  const contracts = useAppSelector(selectContracts);
  const contractLoading = useAppSelector(selectContractLoading);
  const contractStats = useAppSelector(selectContractStats);

  // Statistics
  const hostelStatistics = useAppSelector(selectHostelStatistics);
  const roomStatistics = useAppSelector(selectRoomStatistics);
  const contractStatistics = useAppSelector(selectContractStatistics);

  const [selectedHostel, setSelectedHostel] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load data on component mount
  useEffect(() => {
    dispatch(getHostels());
    dispatch(getRooms());
    dispatch(getContracts());
  }, [dispatch]);

  // Load stats when hostel is selected
  useEffect(() => {
    if (selectedHostel) {
      dispatch(getHostelStats(selectedHostel.id));
      dispatch(getRoomStats(selectedHostel.id));
      dispatch(getContractStats(selectedHostel.id));
    }
  }, [dispatch, selectedHostel]);

  // Table columns
  const hostelColumns = [
    {
      key: "name",
      label: "Hostel Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "city",
      label: "City",
      sortable: true,
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => <StatusBadge status={status} type="hostel" />,
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const roomColumns = [
    {
      key: "room_number",
      label: "Room Number",
      sortable: true,
      searchable: true,
    },
    {
      key: "room_type",
      label: "Type",
      sortable: true,
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      key: "base_price",
      label: "Price",
      sortable: true,
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => <StatusBadge status={status} type="room" />,
    },
    {
      key: "current_occupancy",
      label: "Occupancy",
      sortable: true,
      render: (occupancy, room) => `${occupancy}/${room.max_occupancy}`,
    },
  ];

  const contractColumns = [
    {
      key: "tenant_name",
      label: "Tenant",
      sortable: true,
      searchable: true,
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "end_date",
      label: "End Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "monthly_rent",
      label: "Rent",
      sortable: true,
      render: (rent) => `$${rent.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => <StatusBadge status={status} type="contract" />,
    },
  ];

  // Filter options
  const hostelFilters = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: HOSTEL_STATUS.ACTIVE, label: "Active" },
        { value: HOSTEL_STATUS.INACTIVE, label: "Inactive" },
        { value: HOSTEL_STATUS.MAINTENANCE, label: "Maintenance" },
      ],
    },
    {
      key: "city",
      label: "City",
      type: "text",
      placeholder: "Enter city name",
    },
  ];

  const roomFilters = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: ROOM_STATUS.AVAILABLE, label: "Available" },
        { value: ROOM_STATUS.OCCUPIED, label: "Occupied" },
        { value: ROOM_STATUS.MAINTENANCE, label: "Maintenance" },
        { value: ROOM_STATUS.RESERVED, label: "Reserved" },
      ],
    },
    {
      key: "room_type",
      label: "Type",
      type: "select",
      options: [
        { value: "single", label: "Single" },
        { value: "double", label: "Double" },
        { value: "triple", label: "Triple" },
        { value: "quad", label: "Quad" },
        { value: "dormitory", label: "Dormitory" },
      ],
    },
  ];

  const contractFilters = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: CONTRACT_STATUS.ACTIVE, label: "Active" },
        { value: CONTRACT_STATUS.EXPIRED, label: "Expired" },
        { value: CONTRACT_STATUS.TERMINATED, label: "Terminated" },
        { value: CONTRACT_STATUS.PENDING, label: "Pending" },
      ],
    },
  ];

  const handleHostelSearch = (searchTerm) => {
    // Implement search logic
    console.log("Searching hostels:", searchTerm);
  };

  const handleHostelFilter = (filters) => {
    // Implement filter logic
    console.log("Filtering hostels:", filters);
  };

  const handleRoomSearch = (searchTerm) => {
    // Implement search logic
    console.log("Searching rooms:", searchTerm);
  };

  const handleRoomFilter = (filters) => {
    // Implement filter logic
    console.log("Filtering rooms:", filters);
  };

  const handleContractSearch = (searchTerm) => {
    // Implement search logic
    console.log("Searching contracts:", searchTerm);
  };

  const handleContractFilter = (filters) => {
    // Implement filter logic
    console.log("Filtering contracts:", filters);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hostel Management Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your hostels, rooms, and contracts in one place
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Hostel Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Hostels</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {hostelStatistics.totalHostels}
                </p>
                <p className="text-sm text-gray-500">
                  {hostelStatistics.activeHostels} active
                </p>
              </div>
            </div>
          </div>

          {/* Room Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
                <p className="text-2xl font-bold text-green-600">
                  {roomStatistics.totalRooms}
                </p>
                <p className="text-sm text-gray-500">
                  {roomStatistics.availableRooms} available
                </p>
              </div>
            </div>
          </div>

          {/* Contract Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Contracts</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {contractStatistics.totalContracts}
                </p>
                <p className="text-sm text-gray-500">
                  {contractStatistics.activeContracts} active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview" },
                { id: "hostels", name: "Hostels" },
                { id: "rooms", name: "Rooms" },
                { id: "contracts", name: "Contracts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  System Overview
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <p className="text-gray-600">
                      No recent activity to display.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Add New Hostel
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Add New Room
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Create Contract
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hostels Tab */}
            {activeTab === "hostels" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Hostels
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Hostel
                  </button>
                </div>

                <SearchFilter
                  onSearch={handleHostelSearch}
                  onFilter={handleHostelFilter}
                  filters={hostelFilters}
                  searchPlaceholder="Search hostels..."
                />

                <DataTable
                  data={hostels}
                  columns={hostelColumns}
                  loading={hostelLoading}
                  onRowClick={(hostel) => setSelectedHostel(hostel)}
                  onEdit={(hostel) => console.log("Edit hostel:", hostel)}
                  onDelete={(hostel) => console.log("Delete hostel:", hostel)}
                />
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Room
                  </button>
                </div>

                <SearchFilter
                  onSearch={handleRoomSearch}
                  onFilter={handleRoomFilter}
                  filters={roomFilters}
                  searchPlaceholder="Search rooms..."
                />

                <DataTable
                  data={rooms}
                  columns={roomColumns}
                  loading={roomLoading}
                  onRowClick={(room) => console.log("View room:", room)}
                  onEdit={(room) => console.log("Edit room:", room)}
                  onDelete={(room) => console.log("Delete room:", room)}
                />
              </div>
            )}

            {/* Contracts Tab */}
            {activeTab === "contracts" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contracts
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Contract
                  </button>
                </div>

                <SearchFilter
                  onSearch={handleContractSearch}
                  onFilter={handleContractFilter}
                  filters={contractFilters}
                  searchPlaceholder="Search contracts..."
                />

                <DataTable
                  data={contracts}
                  columns={contractColumns}
                  loading={contractLoading}
                  onRowClick={(contract) =>
                    console.log("View contract:", contract)
                  }
                  onEdit={(contract) => console.log("Edit contract:", contract)}
                  onDelete={(contract) =>
                    console.log("Delete contract:", contract)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostelDashboard;

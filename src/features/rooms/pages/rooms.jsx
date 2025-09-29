import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRooms } from "../hooks/useRooms";
import { useProperty } from "../hooks/useProperty";
import { roomService } from "../services/roomService";
import RoomCard from "../components/RoomCard";
import RoomsTable from "../components/RoomsTable";
import AddRoomModal from "../components/AddRoomModal";
import RoomDetailModal from "../components/RoomDetailModal";
import ViewControls from "../components/ViewControls";

const RoomsPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");
  const [gridColumns, setGridColumns] = useState(3);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
  } = useRooms(propertyId);

  const {
    property,
    stats,
    loading: propertyLoading,
    error: propertyError,
    refreshStats,
  } = useProperty(propertyId);

  const handleAddRoom = async (roomData) => {
    try {
      await createRoom(roomData);
      await refreshStats();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowAddModal(true);
  };

  const handleViewRoom = async (room) => {
    try {
      // Fetch room with tenant information
      const roomWithTenants = await roomService.getRoomById(room.id);
      setSelectedRoom(roomWithTenants);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching room details:", error);
      // Fallback to original room data
      setSelectedRoom(room);
      setShowDetailModal(true);
    }
  };

  const handleUpdateRoom = async (roomData) => {
    try {
      await updateRoom(editingRoom.id, roomData);
      await refreshStats();
      setShowAddModal(false);
      setEditingRoom(null);
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await deleteRoom(roomId);
        await refreshStats();
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  const handleStatusChange = async (roomId, status, currentOccupants) => {
    try {
      await updateRoomStatus(roomId, status, currentOccupants);
      await refreshStats();
    } catch (error) {
      console.error("Error updating room status:", error);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRoom(null);
  };

  if (propertyLoading || roomsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (propertyError || roomsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{propertyError || roomsError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy nhà trọ
          </h2>
          <p className="text-gray-600 mb-4">
            Nhà trọ này có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl mx-4 mt-4 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white hover:bg-blue-500 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Quản lý phòng - {property.name}
                </h1>
                <div className="flex items-center space-x-2 text-blue-100 mt-2">
                  <span>{property.address}</span>
                  {property.city && (
                    <>
                      <span>•</span>
                      <span>{property.city}</span>
                    </>
                  )}
                  {property.ward && (
                    <>
                      <span>•</span>
                      <span>{property.ward}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Thêm phòng</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.656-.227 1 1 0 00.656.227l2.25.9a.5.5 0 01.2.1l.9-.45 1.45-.725a1 1 0 00.9 0l7 3.5a1 1 0 000-1.84L14.75 8.051a.999.999 0 01-.656-.227 1 1 0 00-.656.227l-2.25.9a.5.5 0 01-.2.1l-.9.45-1.45.725a1 1 0 00-.9 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Tổng phòng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRooms || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đã thuê</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.occupiedRooms || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Trống</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.vacantRooms || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Số người hiện tại
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.currentOccupants || 0} người
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* View Controls */}
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
        />

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Chưa có phòng nào
            </h3>
            <p className="mt-2 text-gray-500">
              Bắt đầu bằng cách thêm phòng đầu tiên cho nhà trọ này.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Thêm phòng đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div
                className={`grid gap-4 ${
                  gridColumns === 1
                    ? "grid-cols-1"
                    : gridColumns === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : gridColumns === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : gridColumns === 4
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleViewRoom}
                    onDelete={handleDeleteRoom}
                    onStatusChange={handleStatusChange}
                    onRentalSuccess={() => {
                      // Refresh rooms data after successful rental
                      window.location.reload();
                    }}
                  />
                ))}
              </div>
            ) : (
              <RoomsTable
                rooms={rooms}
                onEdit={handleViewRoom}
                onDelete={handleDeleteRoom}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
        )}

        {/* Add/Edit Room Modal */}
        <AddRoomModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom}
          propertyId={propertyId}
          editingRoom={editingRoom}
        />

        {/* Room Detail Modal */}
        <RoomDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          room={selectedRoom}
          onEdit={handleEditRoom}
          onDelete={handleDeleteRoom}
        />
      </div>
    </div>
  );
};

export default RoomsPage;

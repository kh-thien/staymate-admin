import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRooms } from "../hooks/useRooms";
import { useProperty } from "../hooks/useProperty";
import { roomService } from "../services/roomService";
import { rentalService } from "../services/rentalService";
import RoomCard from "../components/RoomCard";
import RoomsTable from "../components/RoomsTable";
import AddRoomModal from "../components/AddRoomModal";
import RoomDetailModal from "../components/RoomDetailModal";
import RentalModal from "../components/RentalModal";
import ViewControls from "../components/ViewControls";

const RoomsPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");
  const [gridColumns, setGridColumns] = useState(3);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rentalRoom, setRentalRoom] = useState(null);

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
    try {
      // Check if room can be deleted first
      const canDelete = await roomService.canDeleteRoom(roomId);
      
      if (!canDelete.canDelete) {
        alert(`❌ ${canDelete.reason}`);
        return;
      }

      // Confirm deletion
      const confirmMessage = `Bạn có chắc chắn muốn xóa phòng này?\n\n${canDelete.reason}`;
      if (window.confirm(confirmMessage)) {
        await deleteRoom(roomId);
        await refreshStats();
        alert("✅ Xóa phòng thành công!");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(`❌ Lỗi khi xóa phòng: ${error.message}`);
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

  const handleRental = (room) => {
    setRentalRoom(room);
    setShowRentalModal(true);
  };

  const handleRentalSubmit = async (rentalData) => {
    try {
      await rentalService.createRental(rentalData);
      setShowRentalModal(false);
      setRentalRoom(null);
      await refreshStats();
      // Refresh rooms data
      window.location.reload();
    } catch (error) {
      console.error("Error creating rental:", error);
      throw error;
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

  const handleCloseRentalModal = () => {
    setShowRentalModal(false);
    setRentalRoom(null);
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
    <div className="space-y-6">
      {/* Header - TailAdmin style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý phòng - {property.name}
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-10">
            {property.address}
            {property.city && `, ${property.city}`}
            {property.ward && `, ${property.ward}`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Thêm phòng
        </button>
      </div>

      {/* Statistics - TailAdmin compact style */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Tổng phòng
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalRooms || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Đã thuê
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.occupiedRooms || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Trống
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.vacantRooms || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Số người hiện tại
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.currentOccupants || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Controls - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
        />
      </div>

      {/* Rooms Content */}
      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có phòng nào
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Thêm phòng đầu tiên để bắt đầu quản lý
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Thêm ngay
          </button>
        </div>
      ) : viewMode === "table" ? (
        <RoomsTable
          rooms={rooms}
          onEdit={handleViewRoom}
          onDelete={handleDeleteRoom}
          onRental={handleRental}
        />
      ) : (
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

      {/* Rental Modal */}
      <RentalModal
        isOpen={showRentalModal}
        onClose={handleCloseRentalModal}
        onSubmit={handleRentalSubmit}
        room={rentalRoom}
      />
    </div>
  );
};

export default RoomsPage;

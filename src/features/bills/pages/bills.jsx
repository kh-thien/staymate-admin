import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useBills } from "../hooks/useBills";
import BillsTable from "../components/BillsTable";
import BillFilters from "../components/BillFilters";
import BillFormModal from "../components/BillFormModal";
import BillViewModal from "../components/BillViewModal";
import { billService } from "../services/billService";
import { propertyService } from "../../property/services/propertyService";
import { roomService } from "../../rooms/services/roomService";
import { supabase } from "../../../core/data/remote/supabase";
import { Pagination } from "../../../core/components/ui";

const Bills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sendingReminders, setSendingReminders] = useState({}); // { billId: true }
  const [sentReminders, setSentReminders] = useState(() => {
    // Load từ localStorage và cleanup expired entries
    try {
      const stored = localStorage.getItem("bill_reminders_sent");
      const reminders = stored ? JSON.parse(stored) : {};
      
      // Cleanup entries older than 24 hours
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const cleaned = {};
      
      Object.keys(reminders).forEach((billId) => {
        const sentTime = reminders[billId];
        if (now - sentTime < oneDayInMs) {
          cleaned[billId] = sentTime;
        }
      });
      
      // Update localStorage if cleaned
      if (Object.keys(cleaned).length !== Object.keys(reminders).length) {
        localStorage.setItem("bill_reminders_sent", JSON.stringify(cleaned));
      }
      
      return cleaned;
    } catch {
      return {};
    }
  });

  const filters = {
    search: searchTerm,
    status: statusFilter,
    property: propertyFilter,
    room: roomFilter,
    periodFrom,
    periodTo,
    dueDateFrom,
    dueDateTo,
    sortBy,
    sortOrder,
  };

  const { bills, loading, error, stats, deleteBill, refreshBills } =
    useBills(filters);

  // Load properties for filter
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const propertiesData = await propertyService.getPropertiesByOwner(
            user.id
          );
          setProperties(propertiesData || []);
        }
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    };
    loadProperties();
  }, []);

  // Load rooms when property filter changes
  useEffect(() => {
    const loadRooms = async () => {
      try {
        if (propertyFilter && propertyFilter !== "all") {
          // Load rooms for selected property
          const roomsData = await roomService.getRoomsByProperty(propertyFilter);
          setRooms(roomsData || []);
        } else {
          // Load all rooms from all properties
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const propertiesData = await propertyService.getPropertiesByOwner(
              user.id
            );
            const allRooms = [];
            for (const property of propertiesData || []) {
              try {
                const roomsData = await roomService.getRoomsByProperty(property.id);
                if (roomsData) {
                  allRooms.push(...roomsData);
                }
              } catch (err) {
                console.error(`Error loading rooms for property ${property.id}:`, err);
              }
            }
            setRooms(allRooms);
          } else {
            setRooms([]);
          }
        }
      } catch (error) {
        console.error("Error loading rooms:", error);
        setRooms([]);
      }
    };
    loadRooms();
  }, [propertyFilter]);

  // State to force re-render every minute for cooldown timer
  const [, setTick] = useState(0);

  // Update cooldown timer every minute for bills in cooldown
  useEffect(() => {
    // Check if there are any bills in cooldown (sent within last hour)
    const oneHourInMs = 60 * 60 * 1000;
    const now = Date.now();
    const hasBillsInCooldown = Object.keys(sentReminders).some((billId) => {
      const sentTime = sentReminders[billId];
      return sentTime && now - sentTime < oneHourInMs;
    });

    if (!hasBillsInCooldown) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const oneHourInMs = 60 * 60 * 1000;
      
      // Clean up expired reminders
      setSentReminders((prev) => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach((billId) => {
          if (now - updated[billId] >= oneHourInMs) {
            delete updated[billId];
            hasChanges = true;
          }
        });

        // Update localStorage if there are changes
        if (hasChanges) {
          try {
            localStorage.setItem("bill_reminders_sent", JSON.stringify(updated));
          } catch (error) {
            console.error("Error updating localStorage:", error);
          }
        }

        return hasChanges ? updated : prev;
      });

      // Force re-render to update countdown timer display
      setTick((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sentReminders]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Pagination logic
  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBills = bills.slice(startIndex, endIndex);

  const handleFilterChange = (newFilters) => {
    setStatusFilter(newFilters.status);
    setPropertyFilter(newFilters.property);
    setRoomFilter(newFilters.room || "all");
    setSortBy(newFilters.sortBy);
    setSortOrder(newFilters.sortOrder);
    setPeriodFrom(newFilters.periodFrom || "");
    setPeriodTo(newFilters.periodTo || "");
    setDueDateFrom(newFilters.dueDateFrom || "");
    setDueDateTo(newFilters.dueDateTo || "");
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setShowModal(true);
  };

  const handleViewBill = async (bill) => {
    try {
      // Load full bill data with relationships
      const fullBillData = await billService.getBillById(bill.id);
      setViewingBill(fullBillData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error loading bill for view:", error);
      alert(`Lỗi tải hóa đơn: ${error.message}`);
    }
  };

  const handleEditBill = async (bill) => {
    try {
      // Kiểm tra xem bill có được phép sửa không
      if (bill.status === "PAID" || bill.status === "CANCELLED") {
        const statusText = bill.status === "PAID" ? "đã thanh toán" : "đã hủy";
        alert(`❌ Không thể sửa hóa đơn "${bill.bill_number}" vì ${statusText}`);
        return;
      }

      // Load full bill data with relationships before opening modal
      const fullBillData = await billService.getBillById(bill.id);
      console.log("✅ Loaded full bill data for edit:", fullBillData);

      // Kiểm tra lại sau khi load (đề phòng status thay đổi)
      if (fullBillData.status === "PAID" || fullBillData.status === "CANCELLED") {
        const statusText = fullBillData.status === "PAID" ? "đã thanh toán" : "đã hủy";
        alert(`❌ Không thể sửa hóa đơn "${fullBillData.bill_number}" vì ${statusText}`);
        return;
      }

      // Set editingBill first, then open modal after a small delay to ensure state update
      setEditingBill(fullBillData);

      // Use setTimeout to ensure editingBill state is updated before modal opens
      setTimeout(() => {
        setShowModal(true);
      }, 0);
    } catch (error) {
      console.error("Error loading bill for edit:", error);
      alert(`Lỗi tải hóa đơn: ${error.message}`);
    }
  };

  const handleSubmitBill = async (billData) => {
    try {
      if (editingBill) {
        // Update existing bill
        await billService.updateBill(editingBill.id, billData);
        alert("✅ Cập nhật hóa đơn thành công!");
      } else {
        // Create new bill
        await billService.createBill(billData);
        alert("✅ Tạo hóa đơn thành công!");
      }
      refreshBills();
    } catch (error) {
      console.error("Error submitting bill:", error);
      throw error;
    }
  };

  const handleDeleteBill = async (bill) => {
    if (window.confirm(`Bạn có chắc muốn xóa hóa đơn "${bill.bill_number}"?`)) {
      try {
        await deleteBill(bill.id);
        alert("✅ Đã xóa hóa đơn thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa hóa đơn: ${error.message}`);
      }
    }
  };

  // Check if reminder was sent recently (within 1 hour)
  const isReminderRecentlySent = (billId) => {
    const sentTime = sentReminders[billId];
    if (!sentTime) return false;

    const oneHourInMs = 60 * 60 * 1000; // 1 hour
    const timeSinceSent = Date.now() - sentTime;
    return timeSinceSent < oneHourInMs;
  };

  // Get remaining cooldown time in minutes
  const getRemainingCooldownMinutes = (billId) => {
    const sentTime = sentReminders[billId];
    if (!sentTime) return 0;

    const oneHourInMs = 60 * 60 * 1000;
    const timeSinceSent = Date.now() - sentTime;
    const remainingMs = oneHourInMs - timeSinceSent;

    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / (60 * 1000)); // Convert to minutes
  };

  // Save sent reminder to localStorage
  const saveSentReminder = (billId) => {
    const newSentReminders = {
      ...sentReminders,
      [billId]: Date.now(),
    };
    setSentReminders(newSentReminders);
    try {
      localStorage.setItem("bill_reminders_sent", JSON.stringify(newSentReminders));
    } catch (error) {
      console.error("Error saving reminder to localStorage:", error);
    }
  };

  const handleSendOverdueReminder = async (bill) => {
    if (!bill || bill.status !== "OVERDUE") {
      alert("❌ Chỉ có thể gửi nhắc đóng cho hóa đơn quá hạn");
      return;
    }

    // Check if already sending
    if (sendingReminders[bill.id]) {
      return;
    }

    // Check if recently sent (within 1 hour)
    if (isReminderRecentlySent(bill.id)) {
      const remainingMinutes = getRemainingCooldownMinutes(bill.id);
      alert(
        `⏰ Bạn vừa gửi thông báo nhắc đóng cho hóa đơn này. Vui lòng đợi ${remainingMinutes} phút nữa trước khi gửi lại.`
      );
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn gửi thông báo nhắc đóng cho hóa đơn "${bill.bill_number}"?`
      )
    ) {
      return;
    }

    // Add to sending state
    setSendingReminders((prev) => ({ ...prev, [bill.id]: true }));

    try {
      await billService.sendOverdueReminder(bill.id);
      // Save to localStorage
      saveSentReminder(bill.id);
      alert("✅ Đã gửi thông báo nhắc đóng thành công!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert(`❌ Lỗi khi gửi thông báo nhắc đóng: ${error.message}`);
    } finally {
      // Remove from sending state
      setSendingReminders((prev) => {
        const newState = { ...prev };
        delete newState[bill.id];
        return newState;
      });
    }
  };

  const handleCheckOverdueBills = async () => {
    setIsCheckingOverdue(true);
    try {
      const result = await billService.checkAndUpdateOverdueBills();

      if (result.updatedCount > 0) {
        alert(`✅ Đã cập nhật ${result.updatedCount} hóa đơn quá hạn!`);
        // Refresh bills to show updated data
        refreshBills();
      } else {
        alert("✅ Không có hóa đơn quá hạn nào cần cập nhật");
      }
    } catch (error) {
      alert(`❌ Lỗi khi kiểm tra hóa đơn quá hạn: ${error.message}`);
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshBills}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hóa đơn</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý hóa đơn thanh toán
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckOverdueBills}
            disabled={isCheckingOverdue}
            className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kiểm tra quá hạn"
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-1.5 ${
                isCheckingOverdue ? "animate-spin" : ""
              }`}
            />
            {isCheckingOverdue ? "Đang kiểm tra..." : "Cập nhật"}
          </button>
          <button
            onClick={handleAddBill}
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
            Tạo mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng hóa đơn</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.paid}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Chưa thanh toán</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.unpaid}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Quá hạn</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.overdue}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BillFilters
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        propertyFilter={propertyFilter}
        roomFilter={roomFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        properties={properties}
        rooms={rooms}
      />

      {/* Bills Table */}
      <BillsTable
        bills={paginatedBills}
        onView={handleViewBill}
        onEdit={handleEditBill}
        onDelete={handleDeleteBill}
        onSendReminder={handleSendOverdueReminder}
        sendingReminders={sendingReminders}
        sentReminders={sentReminders}
        isReminderRecentlySent={isReminderRecentlySent}
        getRemainingCooldownMinutes={getRemainingCooldownMinutes}
        loading={loading}
      />

      {/* Pagination */}
      {bills.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={bills.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex - 1}
        />
      )}

      {/* Bill View Modal (Read-only) */}
      <BillViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingBill(null);
        }}
        bill={viewingBill}
      />

      {/* Bill Form Modal (Create/Edit) */}
      <BillFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBill(null);
        }}
        bill={editingBill}
        onSubmit={handleSubmitBill}
      />
    </div>
  );
};

export default Bills;

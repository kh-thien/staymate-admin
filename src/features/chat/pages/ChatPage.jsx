import React, { useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import TenantSearchModal from "../components/TenantSearchModal";
import { supabase } from "../../../core/data/remote/supabase";
import { chatService } from "../services/chatService";
import { useAppLayout } from "../../appLayout/context/useAppLayout";

const ChatPage = () => {
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    sendMessage,
    selectRoom,
    loadRooms,
    loadMoreMessages,
  } = useChat();

  const { sidebarOpen } = useAppLayout();
  const [showMobileList, setShowMobileList] = useState(true);
  const [showTenantSearch, setShowTenantSearch] = useState(false);

  const handleSendMessage = async (
    content,
    messageType = "TEXT",
    replyTo = null,
    fileData = null
  ) => {
    if (!currentRoom) return;

    try {
      await sendMessage(content, messageType, replyTo, fileData);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSelectRoom = (room) => {
    selectRoom(room);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  const handleSelectTenant = async (tenant) => {
    try {
      // Get current admin user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create or get chat room with tenant
      const result = await chatService.createChatRoomWithTenant(
        tenant.user_id, // tenant's user_id
        user.id // admin's user_id
      );

      if (result.success) {
        // Reload rooms list to include the new/existing room
        await loadRooms();

        // Select and open the room
        await selectRoom(result.room);

        // Close search modal
        setShowTenantSearch(false);

        // Switch to chat view on mobile
        setShowMobileList(false);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
      alert("Không thể tạo phòng chat: " + error.message);
    }
  };

  if (error) {
    return (
      <div
        className={`fixed inset-0 top-16 right-0 flex items-center justify-center bg-[#F1F5F9] z-20 transition-all duration-300 ${
          sidebarOpen ? "lg:left-72" : "lg:left-0"
        }`}
      >
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#3C50E0] text-white rounded-lg hover:bg-[#3347C6] transition-colors text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 top-16 right-0 bg-[#F1F5F9] flex flex-col overflow-hidden z-20 transition-all duration-300 ${
        sidebarOpen ? "lg:left-72" : "lg:left-0"
      }`}
    >
      {/* Chat Interface - TailAdmin modern style with spacing and rounded corners */}
      <div className="flex-1 flex min-h-0 h-full p-8">
        <div className="flex-1 flex min-h-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Desktop Layout */}
          <div className="hidden lg:flex w-full h-full min-h-0">
            <ChatList
              rooms={rooms}
              currentRoom={currentRoom}
              onSelectRoom={handleSelectRoom}
              loading={loading}
              onOpenTenantSearch={() => setShowTenantSearch(true)}
            />
            <ChatWindow
              currentRoom={currentRoom}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMoreMessages}
            />
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden w-full h-full min-h-0">
            {showMobileList ? (
              <ChatList
                rooms={rooms}
                currentRoom={currentRoom}
                onSelectRoom={handleSelectRoom}
                loading={loading}
                onOpenTenantSearch={() => setShowTenantSearch(true)}
              />
            ) : (
              <ChatWindow
                currentRoom={currentRoom}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBack={handleBackToList}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMoreMessages}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tenant Search Modal */}
      <TenantSearchModal
        isOpen={showTenantSearch}
        onClose={() => setShowTenantSearch(false)}
        onSelectTenant={handleSelectTenant}
      />
    </div>
  );
};

export default ChatPage;

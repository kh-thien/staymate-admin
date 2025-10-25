import React, { useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import TenantSearchModal from "../components/TenantSearchModal";

const ChatPage = () => {
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    sendMessage,
    selectRoom,
    loadRooms,
  } = useChat();

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
      // TODO: Implement create chat room with tenant
      console.log("Selected tenant:", tenant);
      setShowTenantSearch(false);
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Chat Interface */}
      <div className="h-full flex p-4">
        <div className="flex-1 flex bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-1">
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
            />
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex-1 flex">
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
              />
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-3xl m-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm text-gray-600 font-medium">Đang tải...</p>
          </div>
        </div>
      )}

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

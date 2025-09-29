import React, { useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

const ChatPage = () => {
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    notifications,
    sendMessage,
    uploadFile,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    selectRoom,
    handleTyping,
    clearError,
  } = useChat();

  const [showMobileList, setShowMobileList] = useState(true);

  const handleSendMessage = async (content, messageType, replyTo, fileData) => {
    try {
      if (fileData) {
        // Upload file first
        const uploadedFile = await uploadFile(fileData.file);
        await sendMessage(content, messageType, replyTo, uploadedFile);
      } else {
        await sendMessage(content, messageType, replyTo);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectRoom = (room) => {
    selectRoom(room);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu chat
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
            />
            <ChatWindow
              currentRoom={currentRoom}
              messages={messages}
              onSendMessage={handleSendMessage}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
              onReplyMessage={(message) => {
                // Handle reply logic
              }}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
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
              />
            ) : (
              <ChatWindow
                currentRoom={currentRoom}
                messages={messages}
                onSendMessage={handleSendMessage}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
                onReplyMessage={(message) => {
                  // Handle reply logic
                }}
                onAddReaction={addReaction}
                onRemoveReaction={removeReaction}
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
    </div>
  );
};

export default ChatPage;

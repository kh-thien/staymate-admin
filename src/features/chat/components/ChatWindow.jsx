import React, { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import MessageItem from "./MessageItem";

const ChatWindow = ({
  currentRoom,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onAddReaction,
  onRemoveReaction,
  onBack,
  loading = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator to other users
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !replyTo) return;

    try {
      await onSendMessage(newMessage, "TEXT", replyTo?.id);
      setNewMessage("");
      setReplyTo(null);
      setEditingMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle edit message
  const handleEditMessage = async () => {
    if (!editingMessage) return;

    try {
      await onEditMessage(editingMessage.id, newMessage);
      setNewMessage("");
      setEditingMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn. Kích thước tối đa là 10MB.");
      return;
    }

    // Handle file upload
    onSendMessage("", "FILE", null, {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
    setEditingMessage(null);
  };

  // Handle edit
  const handleEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setReplyTo(null);
  };

  // Handle delete
  const handleDelete = async (message) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
      await onDeleteMessage(message.id);
    }
  };

  // Cancel edit/reply
  const handleCancel = () => {
    setEditingMessage(null);
    setReplyTo(null);
    setNewMessage("");
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-gray-500">
            Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-r-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-tr-2xl">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl lg:hidden transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}

          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-sm">
            {currentRoom.type === "GROUP"
              ? "👥"
              : currentRoom.room?.code?.charAt(0) || "R"}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentRoom.name}
            </h3>
            <p className="text-sm text-gray-500">
              {currentRoom.property?.name} - {currentRoom.room?.code}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <PhoneIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <VideoCameraIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-lg font-semibold mb-2">Chưa có tin nhắn nào</p>
            <p className="text-sm text-gray-400">
              Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_type === "LANDLORD";
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id ||
                new Date(message.created_at) -
                  new Date(messages[index - 1].created_at) >
                  5 * 60 * 1000; // 5 minutes

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply/Edit indicator */}
      {(replyTo || editingMessage) && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">
                {editingMessage ? "Chỉnh sửa tin nhắn:" : "Trả lời:"}
              </span>
              <span className="text-sm text-gray-800 truncate max-w-xs bg-white px-3 py-1 rounded-xl">
                {editingMessage?.content || replyTo?.content}
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-6 border-t border-gray-100 bg-white rounded-br-2xl">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                placeholder="Nhập tin nhắn..."
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none placeholder-gray-400"
                rows="1"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              {/* Typing indicator */}
              {isTyping && (
                <div className="absolute bottom-full left-0 mb-2 text-xs text-gray-500 bg-white px-2 py-1 rounded-lg shadow-sm">
                  Đang gõ...
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={!newMessage.trim() && !replyTo}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default ChatWindow;

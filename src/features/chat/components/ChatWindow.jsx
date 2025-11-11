import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import MessageItem from "./MessageItem";
import { chatService } from "../services/chatService";

const ChatWindow = ({
  currentRoom,
  messages,
  onSendMessage,
  onBack,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error when room changes
  useEffect(() => {
    setAvatarError(false);
  }, [currentRoom?.id]);

  // Debug current room
  console.log("🪟 ChatWindow currentRoom:", {
    roomId: currentRoom?.id,
    roomName: currentRoom?.name,
    hasTenantUser: !!currentRoom?.tenantUser,
    tenantName: currentRoom?.tenantUser?.full_name,
    hasAvatar: !!currentRoom?.tenantUser?.avatar_url,
    avatarUrl: currentRoom?.tenantUser?.avatar_url,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle scroll to load more messages
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    // Check if scrolled to top (with 50px threshold)
    if (container.scrollTop < 50) {
      console.log("📜 Loading more messages...");
      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;

      onLoadMore?.().then(() => {
        // Maintain scroll position after loading
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            previousScrollTop + (newScrollHeight - previousScrollHeight);
        });
      });
    }
  }, [loadingMore, hasMore, onLoadMore]);

  // Scroll to bottom on initial load or new message
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  // Reset scroll state when room changes
  useEffect(() => {
    setShouldScrollToBottom(true);
  }, [currentRoom?.id]);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !currentRoom) return;

    try {
      setIsUploading(true);

      if (selectedFile) {
        // Send message with file
        const fileData = await chatService.uploadFile(
          selectedFile,
          currentRoom.id,
          (progress) => setUploadProgress(progress)
        );

        const messageType = selectedFile.type.startsWith("image/")
          ? "IMAGE"
          : "FILE";
        await onSendMessage(
          messageInput.trim() || selectedFile.name,
          messageType,
          null,
          fileData
        );

        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        // Send text message
        await onSendMessage(messageInput.trim());
      }

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Loại file không được hỗ trợ! Chỉ chấp nhận ảnh, PDF và Word.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Chọn cuộc trò chuyện
          </h3>
          <p className="text-xs text-gray-600">
            Chọn một cuộc trò chuyện để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-h-0 overflow-hidden">
      {/* Header - TailAdmin style */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Room Avatar */}
          {currentRoom.tenantUser?.avatar_url && !avatarError ? (
            <img
              src={currentRoom.tenantUser.avatar_url}
              alt={currentRoom.tenantUser.full_name || "Avatar"}
              className="w-9 h-9 rounded-lg object-cover bg-gray-100"
              onError={(e) => {
                console.warn(
                  "❌ Failed to load avatar in header:",
                  currentRoom.tenantUser.avatar_url,
                  "Error details:",
                  e
                );
                setAvatarError(true);
                e.target.style.display = "none";
              }}
              onLoad={() => {
                console.log("✅ Avatar loaded successfully in header:", currentRoom.tenantUser.avatar_url);
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 bg-[#3C50E0] rounded-lg flex items-center justify-center text-white font-medium text-sm">
              {currentRoom.tenantUser?.full_name?.charAt(0)?.toUpperCase() ||
                currentRoom.room?.code?.charAt(0)?.toUpperCase() ||
                "R"}
            </div>
          )}

          {/* Room Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {currentRoom.tenantUser?.full_name || currentRoom.name}
            </h3>
            <p className="text-xs text-gray-500">
              {currentRoom.room?.code} • {currentRoom.room?.properties?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Gọi điện"
          >
            <PhoneIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Video call"
          >
            <VideoCameraIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Tùy chọn"
          >
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages - TailAdmin style */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2.5 bg-[#F1F5F9]"
        onScroll={handleScroll}
      >
        {/* Loading more indicator at top */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#3C50E0] border-t-transparent"></div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3C50E0] border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Chưa có tin nhắn
              </h3>
              <p className="text-xs text-gray-600">
                Gửi tin nhắn đầu tiên để bắt đầu
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_type === "ADMIN"}
              onEdit={() => {}}
              onDelete={() => {}}
              onReply={() => {}}
              onAddReaction={() => {}}
              onRemoveReaction={() => {}}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - TailAdmin modern style */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2.5">
            <div className="flex-shrink-0">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="w-5 h-5 text-[#3C50E0]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-[#3C50E0] h-1 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <button
              onClick={handleRemoveFile}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Đính kèm file"
          >
            <PaperClipIcon className="h-4 w-4" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full px-3 py-2 pr-9 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C50E0] focus:border-transparent resize-none transition-colors"
              rows="1"
              style={{ minHeight: "38px", maxHeight: "120px" }}
            />

            {/* Emoji Button */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Emoji"
            >
              <FaceSmileIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!messageInput.trim() && !selectedFile) || isUploading}
            className="p-2 bg-[#3C50E0] text-white rounded-lg hover:bg-[#3347C6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Gửi tin nhắn"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
            <span
              className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></span>
            <span
              className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></span>
            <span className="ml-1">Đang nhập...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

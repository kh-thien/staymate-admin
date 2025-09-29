import React, { useState, useEffect } from "react";
import { chatService } from "../services/chatService";

const ChatNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifications = await chatService.getNotifications();
        setUnreadCount(notifications.length);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const subscription = chatService.subscribeToNotifications((payload) => {
      if (payload.eventType === "INSERT") {
        setUnreadCount((prev) => prev + 1);
      } else if (payload.eventType === "UPDATE" && payload.new.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default ChatNotificationBadge;

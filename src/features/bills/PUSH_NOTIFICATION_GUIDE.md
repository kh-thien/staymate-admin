# 🔔 Push Notification Implementation Guide

## 📍 Vị trí Code Realtime hiện tại

### 1. Realtime Subscription Code

**File:** `src/features/bills/hooks/useBills.js`  
**Lines:** 82-148

```javascript
// Realtime subscription (matching chat pattern)
useEffect(() => {
  const channel = supabase
    .channel("bills-changes")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "bills",
    }, (payload) => {
      console.log("➕ REALTIME: New bill created:", payload.new);
      // 👈 ĐÂY LÀ NƠI NHẬN EVENT INSERT
      fetchBills();
    })
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "bills",
    }, (payload) => {
      console.log("✏️ REALTIME: Bill updated:", payload.new);
      // 👈 ĐÂY LÀ NƠI NHẬN EVENT UPDATE
      fetchBills();
    })
    .on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "bills",
    }, (payload) => {
      console.log("🗑️ REALTIME: Bill deleted:", payload.old);
      // 👈 ĐÂY LÀ NƠI NHẬN EVENT DELETE
      setBills(prev => prev.filter(bill => bill.id !== payload.old.id));
    })
    .subscribe((status) => {
      console.log("📡 REALTIME Subscription status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 🚀 Cách triển khai Push Notification

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useBills Hook (Realtime Subscription)            │    │
│  │  - Receives database changes                       │    │
│  │  - Triggers notifications                          │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Notification Service                              │    │
│  │  - Check if should notify                          │    │
│  │  - Format notification message                     │    │
│  │  - Send to notification system                     │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Browser Notification API                          │    │
│  │  - Shows browser notification                      │    │
│  │  - Plays sound                                     │    │
│  │  - Badge count                                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục đề xuất

```
src/
├── features/
│   └── bills/
│       ├── hooks/
│       │   └── useBills.js          ← Realtime subscription hiện tại
│       └── services/
│           └── billService.js
│
├── services/                         ← Tạo mới
│   └── notifications/
│       ├── notificationService.js    ← Core notification logic
│       ├── pushNotificationService.js ← Push notification specific
│       └── types.js                  ← Notification types
│
├── hooks/                            ← Tạo mới (global hooks)
│   └── useNotifications.js           ← Global notification hook
│
└── utils/                            ← Tạo mới (nếu chưa có)
    └── permissions.js                ← Browser permission checks
```

---

## 💻 Implementation Steps

### Step 1: Tạo Notification Service

**File:** `src/services/notifications/notificationService.js`

```javascript
/**
 * Core Notification Service
 * Handles browser notifications and permission management
 */

class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.enabled = false;
  }

  /**
   * Request permission from user
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser doesn't support notifications");
      return false;
    }

    if (this.permission === "granted") {
      this.enabled = true;
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    this.enabled = permission === "granted";
    
    return this.enabled;
  }

  /**
   * Show browser notification
   */
  show(title, options = {}) {
    if (!this.enabled) {
      console.warn("Notifications not enabled");
      return null;
    }

    const notification = new Notification(title, {
      icon: "/logo.png",
      badge: "/badge.png",
      tag: options.tag || "default",
      requireInteraction: options.requireInteraction || false,
      ...options,
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Click handler
    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return notification;
  }

  /**
   * Check if notification should be shown
   * (e.g., don't notify if tab is active)
   */
  shouldNotify() {
    return document.hidden; // Only notify if tab is not visible
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
```

---

### Step 2: Tạo Push Notification Service cho Bills

**File:** `src/services/notifications/pushNotificationService.js`

```javascript
import { notificationService } from "./notificationService";

/**
 * Push Notification Service for Bills
 * Handles bill-specific notification logic
 */

class PushNotificationService {
  /**
   * Notify when new bill is created
   */
  notifyNewBill(bill) {
    if (!notificationService.shouldNotify()) {
      return; // Don't notify if user is on the tab
    }

    const title = "📄 Hóa đơn mới";
    const body = `Hóa đơn ${bill.bill_number} đã được tạo\nSố tiền: ${this.formatCurrency(bill.total_amount)}`;

    notificationService.show(title, {
      body,
      icon: "/icons/bill-new.png",
      tag: `bill-new-${bill.id}`,
      data: { billId: bill.id, type: "NEW_BILL" },
      onClick: () => {
        // Navigate to bills page
        window.location.href = "/bills";
      },
    });

    // Play sound (optional)
    this.playNotificationSound();
  }

  /**
   * Notify when bill is updated
   */
  notifyBillUpdate(bill, changes = {}) {
    if (!notificationService.shouldNotify()) {
      return;
    }

    const title = "✏️ Cập nhật hóa đơn";
    const body = this.getBillUpdateMessage(bill, changes);

    notificationService.show(title, {
      body,
      icon: "/icons/bill-update.png",
      tag: `bill-update-${bill.id}`,
      data: { billId: bill.id, type: "UPDATE_BILL" },
      onClick: () => {
        window.location.href = `/bills?highlight=${bill.id}`;
      },
    });
  }

  /**
   * Notify when bill is paid
   */
  notifyBillPaid(bill) {
    if (!notificationService.shouldNotify()) {
      return;
    }

    const title = "💰 Thanh toán thành công";
    const body = `Hóa đơn ${bill.bill_number} đã được thanh toán\nSố tiền: ${this.formatCurrency(bill.total_amount)}`;

    notificationService.show(title, {
      body,
      icon: "/icons/bill-paid.png",
      tag: `bill-paid-${bill.id}`,
      requireInteraction: true, // Keep notification until user clicks
      data: { billId: bill.id, type: "BILL_PAID" },
      onClick: () => {
        window.location.href = `/bills/${bill.id}`;
      },
    });

    this.playSuccessSound();
  }

  /**
   * Notify when bill is overdue
   */
  notifyBillOverdue(bill) {
    const title = "⚠️ Hóa đơn quá hạn";
    const body = `Hóa đơn ${bill.bill_number} đã quá hạn thanh toán\nHạn thanh toán: ${this.formatDate(bill.due_date)}`;

    notificationService.show(title, {
      body,
      icon: "/icons/bill-overdue.png",
      tag: `bill-overdue-${bill.id}`,
      requireInteraction: true,
      data: { billId: bill.id, type: "BILL_OVERDUE" },
      onClick: () => {
        window.location.href = `/bills/${bill.id}`;
      },
    });

    this.playWarningSound();
  }

  /**
   * Helper: Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  /**
   * Helper: Format date
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  /**
   * Helper: Get bill update message
   */
  getBillUpdateMessage(bill, changes) {
    if (changes.status === "paid") {
      return `Hóa đơn ${bill.bill_number} đã được thanh toán`;
    }
    if (changes.status === "overdue") {
      return `Hóa đơn ${bill.bill_number} đã quá hạn`;
    }
    return `Hóa đơn ${bill.bill_number} đã được cập nhật`;
  }

  /**
   * Helper: Play notification sound
   */
  playNotificationSound() {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(err => console.log("Sound play failed:", err));
  }

  /**
   * Helper: Play success sound
   */
  playSuccessSound() {
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch(err => console.log("Sound play failed:", err));
  }

  /**
   * Helper: Play warning sound
   */
  playWarningSound() {
    const audio = new Audio("/sounds/warning.mp3");
    audio.volume = 0.7;
    audio.play().catch(err => console.log("Sound play failed:", err));
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
```

---

### Step 3: Tích hợp vào useBills Hook

**File:** `src/features/bills/hooks/useBills.js`

```javascript
import { useState, useEffect } from "react";
import { billService } from "../services/billService";
import { supabase } from "../../../core/data/remote/supabase";
import { pushNotificationService } from "../../../services/notifications/pushNotificationService"; // 👈 Import

export const useBills = (filters = {}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... existing code ...

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("bills-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("➕ REALTIME: New bill created:", payload.new);
          
          // 🔔 PUSH NOTIFICATION: New Bill
          pushNotificationService.notifyNewBill(payload.new);
          
          fetchBills();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("✏️ REALTIME: Bill updated:", payload.new);
          
          // 🔔 PUSH NOTIFICATION: Bill Updated
          // Check if status changed to "paid"
          if (payload.new.status === "paid" && payload.old.status !== "paid") {
            pushNotificationService.notifyBillPaid(payload.new);
          } else {
            pushNotificationService.notifyBillUpdate(payload.new, {
              status: payload.new.status,
            });
          }
          
          fetchBills();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("🗑️ REALTIME: Bill deleted:", payload.old);
          setBills((prev) => prev.filter((bill) => bill.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("📡 REALTIME Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bills,
    loading,
    error,
    // ... other returns
  };
};
```

---

### Step 4: Tạo Settings UI để bật/tắt notifications

**File:** `src/features/settings/components/NotificationSettings.jsx`

```javascript
import { useState, useEffect } from "react";
import { notificationService } from "../../../services/notifications/notificationService";

export const NotificationSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    setEnabled(notificationService.enabled);
    setPermission(notificationService.permission);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setEnabled(granted);
    setPermission(Notification.permission);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🔔 Thông báo Push</h3>
      
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Trạng thái thông báo</p>
            <p className="text-sm text-gray-500">
              {permission === "granted" && "✅ Đã bật"}
              {permission === "denied" && "❌ Đã từ chối"}
              {permission === "default" && "⚠️ Chưa cấp quyền"}
            </p>
          </div>
          
          {permission !== "granted" && (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Bật thông báo
            </button>
          )}
        </div>

        {/* Test notification */}
        {enabled && (
          <div>
            <button
              onClick={() => {
                notificationService.show("🧪 Test Notification", {
                  body: "Đây là thông báo thử nghiệm",
                  icon: "/logo.png",
                });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Gửi thông báo thử
            </button>
          </div>
        )}

        {/* Notification types */}
        <div className="border-t pt-4">
          <p className="font-medium mb-2">Loại thông báo</p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Hóa đơn mới được tạo</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Hóa đơn được cập nhật</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Thanh toán thành công</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Hóa đơn quá hạn</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 User Flow

### 1. Lần đầu sử dụng:

```
User vào app lần đầu
       ↓
Hiện popup: "Cho phép thông báo?"
       ↓
User click "Allow"
       ↓
Permission: granted ✅
       ↓
Notifications enabled
```

### 2. Khi có bill mới:

```
Owner A tạo bill mới
       ↓
Supabase broadcasts INSERT event
       ↓
Tab của Owner B (đang mở nhưng không focus):
  ├─ Realtime receives event
  ├─ Check: document.hidden = true (tab not active)
  ├─ Show notification: "📄 Hóa đơn mới"
  ├─ Play sound: "ding!"
  └─ Update UI: fetchBills()
       ↓
Owner B clicks notification
       ↓
Browser focuses tab
       ↓
Navigate to /bills page
```

---

## 🔧 Advanced Features

### 1. Notification Preferences (Store in localStorage)

```javascript
// src/services/notifications/notificationPreferences.js

class NotificationPreferences {
  constructor() {
    this.key = "notification_preferences";
    this.defaults = {
      newBill: true,
      billUpdate: true,
      billPaid: true,
      billOverdue: true,
      sound: true,
    };
  }

  get() {
    const stored = localStorage.getItem(this.key);
    return stored ? JSON.parse(stored) : this.defaults;
  }

  set(preferences) {
    localStorage.setItem(this.key, JSON.stringify(preferences));
  }

  isEnabled(type) {
    const prefs = this.get();
    return prefs[type] ?? true;
  }
}

export const notificationPreferences = new NotificationPreferences();
```

### 2. Notification History

```javascript
// Store recent notifications
class NotificationHistory {
  constructor() {
    this.notifications = [];
    this.maxSize = 50;
  }

  add(notification) {
    this.notifications.unshift({
      ...notification,
      timestamp: Date.now(),
      read: false,
    });
    
    if (this.notifications.length > this.maxSize) {
      this.notifications = this.notifications.slice(0, this.maxSize);
    }
  }

  getUnread() {
    return this.notifications.filter(n => !n.read);
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }
}

export const notificationHistory = new NotificationHistory();
```

### 3. Badge Count (Browser Tab Title)

```javascript
// Update tab title with notification count
function updateBadgeCount(count) {
  if (count > 0) {
    document.title = `(${count}) StayMate Admin`;
  } else {
    document.title = "StayMate Admin";
  }
}

// Update favicon with badge
function updateFaviconBadge(count) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Draw original favicon
  const img = document.createElement('img');
  img.src = '/favicon.ico';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 32, 32);
    
    if (count > 0) {
      // Draw red badge
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw count
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(count > 9 ? '9+' : count, 24, 12);
    }
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']");
    link.href = canvas.toDataURL();
  };
}
```

---

## 📱 Mobile Support (Future)

Để hỗ trợ push notification trên mobile app:

### Option 1: Firebase Cloud Messaging (FCM)

```javascript
// Install Firebase
npm install firebase

// src/services/notifications/fcmService.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";

class FCMService {
  async initialize() {
    const messaging = getMessaging();
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY"
    });
    
    console.log("FCM Token:", token);
    
    // Store token in database for this user
    await this.saveTokenToDatabase(token);
    
    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log("FCM Message:", payload);
      this.showNotification(payload);
    });
  }
  
  async saveTokenToDatabase(token) {
    // Save to Supabase
    const { data, error } = await supabase
      .from("user_fcm_tokens")
      .upsert({
        user_id: userId,
        token: token,
        device_type: "web",
        updated_at: new Date(),
      });
  }
}
```

### Option 2: Supabase Edge Functions

```typescript
// supabase/functions/send-push-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { billId, type, userId } = await req.json();
  
  // Get user's FCM tokens
  const { data: tokens } = await supabase
    .from("user_fcm_tokens")
    .select("token")
    .eq("user_id", userId);
  
  // Send push notification via FCM
  for (const { token } of tokens) {
    await sendFCMNotification(token, {
      title: "Hóa đơn mới",
      body: "Bạn có hóa đơn mới cần xem",
      data: { billId, type },
    });
  }
  
  return new Response("OK");
});
```

---

## 🎨 UI Components for Notifications

### Notification Bell Icon

```javascript
// src/components/NotificationBell.jsx

export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg">
          {/* Notification list */}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Checklist Implementation

- [ ] **Step 1:** Tạo `notificationService.js`
- [ ] **Step 2:** Tạo `pushNotificationService.js`
- [ ] **Step 3:** Tích hợp vào `useBills.js`
- [ ] **Step 4:** Tạo Settings UI
- [ ] **Step 5:** Request permission on first load
- [ ] **Step 6:** Test với 2 browser tabs
- [ ] **Step 7:** Add sound files (`/public/sounds/`)
- [ ] **Step 8:** Add notification icons (`/public/icons/`)
- [ ] **Step 9:** Implement notification history
- [ ] **Step 10:** Add badge count

---

## 🧪 Testing Checklist

- [ ] Notification permission request works
- [ ] Notification shows when tab is not active
- [ ] Notification doesn't show when tab is active
- [ ] Click notification focuses tab and navigates
- [ ] Sound plays (if enabled)
- [ ] Multiple notifications don't stack (same tag)
- [ ] Notification auto-closes after 5 seconds
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works in incognito mode
- [ ] Preferences persist in localStorage

---

**Last Updated:** November 1, 2025  
**Version:** 1.0  
**Author:** StayMate Development Team

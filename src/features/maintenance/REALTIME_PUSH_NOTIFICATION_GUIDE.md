# 🔔 Maintenance Realtime & Push Notification Guide

## Tổng quan
Feature maintenance đã implement realtime updates với Supabase postgres_changes. Document này hướng dẫn cách triển khai push notification.

## ✅ Realtime đã hoàn thành

### Database Setup
- **RLS**: DISABLED (để Realtime broadcast tất cả events)
- **Publication**: `supabase_realtime` đã include table `maintenance`
- **Replica Identity**: FULL

### Application-Level Security
File: `src/features/maintenance/services/maintenanceService.js`

```javascript
// User chỉ xem được maintenance nếu:
1. User là người report (user_report_id = auth.uid())
2. User sở hữu property (property_id in user's properties)
3. User là tenant có contract active ở room (room_id in user's active rooms)
```

### Realtime Events
File: `src/features/maintenance/hooks/useMaintenance.js`

**3 trigger points đã được đánh dấu:**

#### 1. INSERT Event
```javascript
// 📍 PUSH NOTIFICATION TRIGGER POINT - INSERT
// Location: Line ~118
// Payload: payload.new (maintenance record mới)
// Use case: Thông báo cho property owner khi có maintenance mới
```

#### 2. UPDATE Event
```javascript
// 📍 PUSH NOTIFICATION TRIGGER POINT - UPDATE
// Location: Line ~130
// Payload: payload.new (maintenance record sau update)
// Use case: Thông báo khi status thay đổi (PENDING → IN_PROGRESS, etc)
```

#### 3. DELETE Event
```javascript
// 📍 PUSH NOTIFICATION TRIGGER POINT - DELETE
// Location: Line ~142
// Payload: payload.old (maintenance record bị xóa)
// Use case: Thông báo khi maintenance bị hủy/xóa
```

## 🚀 Triển khai Push Notification

### Option 1: Browser Notification (Đơn giản)

```javascript
// Thêm vào INSERT/UPDATE handlers
if (typeof window !== "undefined" && "Notification" in window) {
  if (Notification.permission === "granted") {
    new Notification("Yêu cầu bảo trì mới", {
      body: `${payload.new.title} - ${payload.new.status}`,
      icon: "/stay_mate_logo_clean.png",
      tag: payload.new.id, // Prevent duplicates
    });
  }
}
```

### Option 2: Firebase Cloud Messaging (Khuyến nghị)

#### Step 1: Install Firebase
```bash
npm install firebase
```

#### Step 2: Initialize Firebase
```javascript
// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  // Your config from Firebase Console
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
```

#### Step 3: Request Permission & Get FCM Token
```javascript
// src/features/maintenance/hooks/usePushNotification.js
export const usePushNotification = () => {
  const requestPermission = async () => {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY"
    });
    
    // Save token to user profile in Supabase
    await supabase
      .from("users")
      .update({ fcm_token: token })
      .eq("userid", auth.uid());
  };
  
  return { requestPermission };
};
```

#### Step 4: Send Notification from Realtime Handler
```javascript
// In INSERT/UPDATE handlers
const sendPushNotification = async (maintenanceData) => {
  // Get FCM tokens of users who should receive notification
  const { propertyIds, roomIds } = await getUserAccessInfo();
  
  const { data: users } = await supabase
    .from("users")
    .select("fcm_token")
    .or(`
      id.in.(SELECT owner_id FROM properties WHERE id IN (${propertyIds})),
      id.in.(SELECT tenant_id FROM contracts WHERE room_id IN (${roomIds}))
    `);
  
  // Call your backend API to send FCM notification
  await fetch("/api/send-notification", {
    method: "POST",
    body: JSON.stringify({
      tokens: users.map(u => u.fcm_token).filter(Boolean),
      title: "Yêu cầu bảo trì mới",
      body: maintenanceData.title,
      data: { maintenanceId: maintenanceData.id }
    })
  });
};
```

### Option 3: Supabase Edge Function (Tự động)

#### Create Edge Function
```typescript
// supabase/functions/maintenance-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { record, type } = await req.json();
  
  // Get users who should receive notification
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", record.property_id)
    .single();
  
  // Send notification to property owner
  // TODO: Implement FCM/push notification logic
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

#### Create Database Trigger
```sql
-- Trigger to call Edge Function on maintenance changes
CREATE OR REPLACE FUNCTION notify_maintenance_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'YOUR_EDGE_FUNCTION_URL',
    body := json_build_object(
      'record', NEW,
      'type', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_notification_trigger
AFTER INSERT OR UPDATE ON maintenance
FOR EACH ROW
EXECUTE FUNCTION notify_maintenance_change();
```

## 📋 Notification Rules

### Ai nhận notification?

#### INSERT (Maintenance mới):
- ✅ Property owner
- ✅ Admin users (role = 'ADMIN')
- ❌ Không gửi cho người tạo (tránh duplicate)

#### UPDATE (Status change):
- ✅ Property owner
- ✅ Người report (user_report_id)
- ✅ Tenant của room (nếu có room_id)
- ❌ Không gửi cho người thực hiện update

#### DELETE:
- ✅ Người report
- ✅ Property owner

### Notification Content Template

```javascript
const getNotificationContent = (type, maintenance) => {
  switch (type) {
    case "INSERT":
      return {
        title: "Yêu cầu bảo trì mới",
        body: `${maintenance.title} tại ${maintenance.properties.name}`,
        action: `/maintenance/${maintenance.id}`
      };
      
    case "UPDATE":
      return {
        title: "Cập nhật trạng thái bảo trì",
        body: `${maintenance.title} - ${maintenance.status}`,
        action: `/maintenance/${maintenance.id}`
      };
      
    case "DELETE":
      return {
        title: "Yêu cầu bảo trì đã bị hủy",
        body: maintenance.title,
        action: `/maintenance`
      };
  }
};
```

## 🔍 Testing

### Test Realtime
1. Mở 2 tabs cùng page `/maintenance`
2. Tab A: Kéo thả card
3. Tab B: Kiểm tra console log `🔔 REALTIME: Maintenance updated`
4. Tab B: Card tự động update

### Test Push Notification (sau khi implement)
1. Request notification permission
2. Tạo/cập nhật maintenance
3. Kiểm tra notification hiển thị
4. Click notification → Navigate đến maintenance detail

## 📚 References
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- Bills Feature: `src/features/bills/hooks/useBills.js` (working example)

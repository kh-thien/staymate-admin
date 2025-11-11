# 💬 CHAT SYSTEM - ADMIN WEB TO TENANT FLOW DOCUMENTATION

## 📋 Mục lục
1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Database Schema](#database-schema)
3. [Flow 1: Tạo phòng chat mới](#flow-1-tạo-phòng-chat-mới)
4. [Flow 2: Gửi tin nhắn](#flow-2-gửi-tin-nhắn)
5. [Flow 3: Nhận và đọc tin nhắn](#flow-3-nhận-và-đọc-tin-nhắn)
6. [Flow 4: Load danh sách chat rooms](#flow-4-load-danh-sách-chat-rooms)
7. [Các sự kiện Database](#các-sự-kiện-database)
8. [Supabase Realtime Integration](#supabase-realtime-integration)

---

## 🎯 Tổng quan hệ thống

### Vai trò
- **Admin/Staff**: Quản lý tòa nhà, có thể chat với tất cả tenants
- **Tenant**: Người thuê, chỉ chat với admin/staff của property mình

### Kiến trúc
```
┌─────────────────┐         ┌─────────────────┐
│   Admin Web     │◄───────►│   Supabase DB   │
│   (React)       │         │   + Realtime    │
└─────────────────┘         └─────────────────┘
                                    ▲
                                    │
                            ┌───────┴────────┐
                            │  Mobile App    │
                            │  (Tenant)      │
                            └────────────────┘
```

---

## 🗄️ Database Schema

### 1. **chat_rooms** - Phòng chat
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  room_id UUID REFERENCES rooms(id),           -- Phòng thuê liên quan
  contract_id UUID REFERENCES contracts(id),   -- Hợp đồng liên quan
  name TEXT,                                    -- Tên phòng chat
  type TEXT DEFAULT 'DIRECT',                   -- DIRECT, TENANT_CHAT, GROUP
  created_by UUID NOT NULL REFERENCES users(userid),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  is_activated BOOLEAN DEFAULT false,           -- Đã kích hoạt chưa
  room_code TEXT                                -- Mã phòng thuê
);

-- Index
CREATE INDEX idx_chat_rooms_updated_at ON chat_rooms(updated_at DESC);
CREATE INDEX idx_chat_rooms_property ON chat_rooms(property_id);
```

### 2. **chat_participants** - Người tham gia
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id),
  user_id UUID NOT NULL REFERENCES users(userid),
  user_type TEXT NOT NULL,                      -- ADMIN, TENANT
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  
  UNIQUE(room_id, user_id)
);

-- Index
CREATE INDEX idx_participants_room ON chat_participants(room_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);
```

### 3. **chat_messages** - Tin nhắn
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id),
  sender_id UUID NOT NULL REFERENCES users(userid),
  sender_type TEXT NOT NULL,                    -- ADMIN, TENANT
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  message_type TEXT DEFAULT 'TEXT',             -- TEXT, IMAGE, FILE, AUDIO
  
  -- File attachments
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT CHECK (file_size IS NULL OR file_size <= 52428800), -- 50MB
  
  -- Reply & edit
  reply_to UUID REFERENCES chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
```

### 4. **chat_notifications** - Thông báo
```sql
CREATE TABLE chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(userid),
  room_id UUID NOT NULL REFERENCES chat_rooms(id),
  message_id UUID NOT NULL REFERENCES chat_messages(id),
  type TEXT NOT NULL,                           -- NEW_MESSAGE, MENTION
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_notifications_user_unread ON chat_notifications(user_id, is_read);
```

### 5. **message_reactions** - Reactions
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id),
  user_id UUID NOT NULL REFERENCES users(userid),
  reaction TEXT NOT NULL,                       -- 👍, ❤️, 😂, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(message_id, user_id, reaction)
);
```

---

## 🔄 Flow 1: Tạo phòng chat mới

### User Story
> Admin muốn chat với một tenant cụ thể về vấn đề phòng/hợp đồng

### UI Flow
```
Admin Dashboard → Chat Page → Click "New Chat" → Search Tenant → Select Tenant → Chat Window Opens
```

### Step-by-Step Flow

#### **Step 1: Admin mở modal tìm kiếm tenant**
```javascript
// File: src/features/chat/pages/ChatPage.jsx
const ChatPage = () => {
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowTenantSearch(true)}>
        + New Chat
      </button>
      
      <TenantSearchModal 
        isOpen={showTenantSearch}
        onClose={() => setShowTenantSearch(false)}
        onSelectTenant={handleSelectTenant}
      />
    </div>
  );
};
```

#### **Step 2: Tìm kiếm tenant**
```javascript
// File: src/features/chat/services/chatService.js

async searchTenantsForChat(searchTerm) {
  const { data, error } = await supabase
    .from("tenants")
    .select(`
      id,
      fullname,
      email,
      phone,
      account_status,
      user_id,
      rooms(
        id,
        code,
        name,
        properties(id, name, address)
      )
    `)
    .eq("account_status", "ACTIVE")      // ✅ Chỉ tenant đang hoạt động
    .not("user_id", "is", null)          // ✅ Đã có tài khoản
    .or(`fullname.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
    .order("fullname");
    
  return data;
}
```

**🗄️ Database Query:**
```sql
SELECT 
  t.id,
  t.fullname,
  t.email,
  t.phone,
  t.account_status,
  t.user_id,
  r.id as room_id,
  r.code as room_code,
  r.name as room_name,
  p.id as property_id,
  p.name as property_name,
  p.address as property_address
FROM tenants t
LEFT JOIN rooms r ON r.id = t.room_id
LEFT JOIN properties p ON p.id = r.property_id
WHERE t.account_status = 'ACTIVE'
  AND t.user_id IS NOT NULL
  AND (
    t.fullname ILIKE '%search%' OR
    t.phone ILIKE '%search%' OR
    t.email ILIKE '%search%'
  )
ORDER BY t.fullname;
```

#### **Step 3: Admin chọn tenant**
```javascript
const handleSelectTenant = async (tenant) => {
  try {
    // Lấy current admin user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Tạo hoặc lấy chat room
    const result = await chatService.createChatRoomWithTenant(
      tenant.id,
      user.id
    );
    
    if (result.success) {
      // Mở chat window với room mới/cũ
      selectRoom(result.room);
      setShowTenantSearch(false);
    }
  } catch (error) {
    console.error("Error creating chat room:", error);
  }
};
```

#### **Step 4: Kiểm tra room đã tồn tại chưa**
```javascript
// File: src/features/chat/services/chatService.js

async createChatRoomWithTenant(tenantId, adminUserId) {
  // 4.1 - Tìm tất cả rooms mà admin tham gia
  const { data: adminRooms } = await supabase
    .from("chat_rooms")
    .select(`
      id,
      chat_participants!inner(user_id, user_type)
    `)
    .eq("type", "TENANT_CHAT")
    .eq("chat_participants.user_id", adminUserId)
    .eq("chat_participants.user_type", "ADMIN");
  
  // 4.2 - Duyệt qua từng room, kiểm tra có tenant này không
  for (const room of adminRooms) {
    const { data: participants } = await supabase
      .from("chat_participants")
      .select("user_id, user_type")
      .eq("room_id", room.id);
    
    const hasTenant = participants.some(
      p => p.user_id === tenantId && p.user_type === "TENANT"
    );
    
    if (hasTenant) {
      // ✅ Đã có room, trả về
      return {
        success: true,
        room: await this.getRoomDetails(room.id),
        isNewRoom: false
      };
    }
  }
  
  // 4.3 - Chưa có room, tạo mới
  return await this.createNewChatRoom(tenantId, adminUserId);
}
```

**🗄️ Database Queries:**
```sql
-- Query 1: Tìm rooms của admin
SELECT cr.id, cp.user_id, cp.user_type
FROM chat_rooms cr
INNER JOIN chat_participants cp ON cp.room_id = cr.id
WHERE cr.type = 'TENANT_CHAT'
  AND cp.user_id = 'admin-uuid'
  AND cp.user_type = 'ADMIN';

-- Query 2: Kiểm tra participants của từng room
SELECT user_id, user_type
FROM chat_participants
WHERE room_id = 'room-uuid';
```

#### **Step 5: Tạo chat room mới (nếu chưa có)**
```javascript
async createNewChatRoom(tenantId, adminUserId) {
  // 5.1 - Lấy thông tin tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select(`
      id, fullname, email, phone,
      rooms(id, code, name, properties(id, name, address))
    `)
    .eq("id", tenantId)
    .single();
  
  if (!tenant.rooms || tenant.rooms.length === 0) {
    throw new Error("Người thuê chưa được assign vào phòng nào");
  }
  
  // 5.2 - Tạo chat_rooms record
  const roomName = `Chat với ${tenant.fullname}`;
  const { data: newRoom } = await supabase
    .from("chat_rooms")
    .insert({
      name: roomName,
      type: "TENANT_CHAT",
      property_id: tenant.rooms[0].properties.id,
      room_id: tenant.rooms[0].id,
      created_by: adminUserId,
      is_active: true,
      is_activated: true,
      room_code: tenant.rooms[0].code
    })
    .select()
    .single();
  
  // 5.3 - Thêm participants (admin + tenant)
  const participants = [
    {
      room_id: newRoom.id,
      user_id: adminUserId,
      user_type: "ADMIN",
      is_active: true
    },
    {
      room_id: newRoom.id,
      user_id: tenantId,
      user_type: "TENANT",
      is_active: true
    }
  ];
  
  await supabase
    .from("chat_participants")
    .insert(participants);
  
  // 5.4 - Trả về room với đầy đủ thông tin
  return {
    success: true,
    room: await this.getRoomDetails(newRoom.id),
    isNewRoom: true
  };
}
```

**🗄️ Database Events (Transaction):**
```sql
-- Event 1: INSERT chat_rooms
INSERT INTO chat_rooms (
  id,
  name,
  type,
  property_id,
  room_id,
  created_by,
  created_at,
  updated_at,
  is_active,
  is_activated,
  room_code
) VALUES (
  gen_random_uuid(),
  'Chat với Nguyễn Văn A',
  'TENANT_CHAT',
  'property-uuid',
  'room-uuid',
  'admin-user-uuid',
  NOW(),
  NOW(),
  true,
  true,
  'P101'
) RETURNING *;

-- Event 2: INSERT chat_participants (Admin)
INSERT INTO chat_participants (
  id,
  room_id,
  user_id,
  user_type,
  joined_at,
  last_read_at,
  is_active
) VALUES (
  gen_random_uuid(),
  'new-room-uuid',
  'admin-user-uuid',
  'ADMIN',
  NOW(),
  NOW(),
  true
);

-- Event 3: INSERT chat_participants (Tenant)
INSERT INTO chat_participants (
  id,
  room_id,
  user_id,
  user_type,
  joined_at,
  last_read_at,
  is_active
) VALUES (
  gen_random_uuid(),
  'new-room-uuid',
  'tenant-user-uuid',
  'TENANT',
  NOW(),
  NOW(),
  true
);
```

#### **Step 6: Load room details và hiển thị**
```javascript
async getRoomDetails(roomId) {
  const { data: room } = await supabase
    .from("chat_rooms")
    .select(`
      *,
      chat_participants(user_id, user_type, last_read_at),
      rooms(id, code, name, properties(id, name, address)),
      chat_messages(
        id, content, sender_id, sender_type, 
        created_at, message_type
      )
    `)
    .eq("id", roomId)
    .order("created_at", { 
      foreignTable: "chat_messages", 
      ascending: false 
    })
    .limit(1, { foreignTable: "chat_messages" })
    .single();
  
  return room;
}
```

**🗄️ Database Query:**
```sql
SELECT 
  cr.*,
  -- Participants
  json_agg(DISTINCT jsonb_build_object(
    'user_id', cp.user_id,
    'user_type', cp.user_type,
    'last_read_at', cp.last_read_at
  )) as chat_participants,
  -- Room info
  json_build_object(
    'id', r.id,
    'code', r.code,
    'name', r.name,
    'properties', json_build_object(
      'id', p.id,
      'name', p.name,
      'address', p.address
    )
  ) as rooms,
  -- Last message
  (
    SELECT json_agg(json_build_object(
      'id', cm.id,
      'content', cm.content,
      'sender_id', cm.sender_id,
      'sender_type', cm.sender_type,
      'created_at', cm.created_at,
      'message_type', cm.message_type
    ))
    FROM chat_messages cm
    WHERE cm.room_id = cr.id
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) as chat_messages
FROM chat_rooms cr
LEFT JOIN chat_participants cp ON cp.room_id = cr.id
LEFT JOIN rooms r ON r.id = cr.room_id
LEFT JOIN properties p ON p.id = r.property_id
WHERE cr.id = 'room-uuid'
GROUP BY cr.id, r.id, p.id;
```

---

## 💬 Flow 2: Gửi tin nhắn

### User Story
> Admin/Tenant gửi tin nhắn trong một phòng chat

### UI Flow
```
Chat Window → Type message → Press Enter/Click Send → Message appears
```

### Step-by-Step Flow

#### **Step 1: User nhập và gửi message**
```javascript
// File: src/features/chat/components/ChatWindow.jsx
const ChatWindow = ({ currentRoom, onSendMessage }) => {
  const [message, setMessage] = useState("");
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      await onSendMessage(message, "TEXT");
      setMessage(""); // Clear input
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };
  
  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
```

#### **Step 2: Hook gọi service**
```javascript
// File: src/features/chat/hooks/useChat.js
const sendMessage = useCallback(
  async (content, messageType = "TEXT", replyTo = null, fileData = null) => {
    if (!currentRoom) return;
    
    try {
      const newMessage = await chatService.sendMessage(
        currentRoom.id,
        content,
        messageType,
        replyTo,
        fileData
      );
      
      // Update local state immediately
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  },
  [currentRoom]
);
```

#### **Step 3: Service xử lý gửi message**
```javascript
// File: src/features/chat/services/chatService.js

async sendMessage(roomId, content, messageType = "TEXT", replyTo = null, fileData = null) {
  // 3.1 - Lấy thông tin user hiện tại từ auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // 3.2 - Lấy thông tin từ bảng users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("userid, role")
    .eq("userid", user.id)
    .single();
  
  if (userError || !userData) {
    throw new Error("User not found in database");
  }
  
  // 3.3 - Tạo message data
  const messageData = {
    room_id: roomId,
    content: content,
    sender_id: userData.userid,
    sender_type: userData.role === "ADMIN" ? "ADMIN" : "TENANT",
    message_type: messageType,
    reply_to: replyTo
  };
  
  // 3.4 - Nếu có file đính kèm
  if (fileData) {
    messageData.file_url = fileData.url;
    messageData.file_name = fileData.name;
    messageData.file_size = fileData.size;
  }
  
  // 3.5 - Insert message vào database
  const { data: newMessage, error } = await supabase
    .from("chat_messages")
    .insert(messageData)
    .select()
    .single();
  
  if (error) throw error;
  
  // 3.6 - Cập nhật updated_at của room
  await supabase
    .from("chat_rooms")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", roomId);
  
  // 3.7 - Tạo notifications cho participants khác
  await this.createNotifications(roomId, newMessage.id, userData.userid);
  
  return newMessage;
}
```

**🗄️ Database Events (Step 3):**

```sql
-- Event 1: Get current user info
SELECT userid, role
FROM users
WHERE userid = 'current-auth-user-uuid';

-- Event 2: INSERT chat_messages
INSERT INTO chat_messages (
  id,
  room_id,
  sender_id,
  sender_type,
  content,
  message_type,
  file_url,
  file_name,
  file_size,
  reply_to,
  is_edited,
  is_deleted,
  created_at
) VALUES (
  gen_random_uuid(),
  'room-uuid',
  'sender-user-uuid',
  'ADMIN',                    -- hoặc 'TENANT'
  'Xin chào, tôi có thể giúp gì cho bạn?',
  'TEXT',
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false,
  NOW()
) RETURNING *;

-- Event 3: UPDATE chat_rooms (bump updated_at)
UPDATE chat_rooms
SET updated_at = NOW()
WHERE id = 'room-uuid';
```

#### **Step 4: Tạo notifications**
```javascript
async createNotifications(roomId, messageId, senderId) {
  try {
    // 4.1 - Lấy danh sách participants (trừ người gửi)
    const { data: participants } = await supabase
      .from("chat_participants")
      .select("user_id")
      .eq("room_id", roomId)
      .neq("user_id", senderId);
    
    if (participants && participants.length > 0) {
      // 4.2 - Tạo notification cho từng người
      const notifications = participants.map(p => ({
        user_id: p.user_id,
        room_id: roomId,
        message_id: messageId,
        type: "NEW_MESSAGE",
        is_read: false
      }));
      
      await supabase
        .from("chat_notifications")
        .insert(notifications);
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}
```

**🗄️ Database Events (Step 4):**
```sql
-- Event 4: Get other participants
SELECT user_id
FROM chat_participants
WHERE room_id = 'room-uuid'
  AND user_id != 'sender-user-uuid';

-- Event 5: INSERT chat_notifications (có thể nhiều records)
INSERT INTO chat_notifications (
  id,
  user_id,
  room_id,
  message_id,
  type,
  is_read,
  created_at
) VALUES 
  (gen_random_uuid(), 'tenant-user-uuid', 'room-uuid', 'message-uuid', 'NEW_MESSAGE', false, NOW()),
  (gen_random_uuid(), 'admin2-user-uuid', 'room-uuid', 'message-uuid', 'NEW_MESSAGE', false, NOW());
```

#### **Step 5: UI update**
```javascript
// Message tự động append vào danh sách
setMessages(prev => [...prev, newMessage]);

// Component re-render và scroll xuống message mới
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);
```

---

## 📖 Flow 3: Nhận và đọc tin nhắn

### User Story
> User mở một phòng chat để xem tin nhắn và đánh dấu đã đọc

### Step-by-Step Flow

#### **Step 1: User click vào room trong ChatList**
```javascript
// File: src/features/chat/components/ChatList.jsx
const ChatList = ({ rooms, onSelectRoom }) => {
  return (
    <div>
      {rooms.map(room => (
        <div 
          key={room.id}
          onClick={() => onSelectRoom(room)}
          className={room.unreadCount > 0 ? 'unread' : ''}
        >
          <h3>{room.displayName}</h3>
          <p>{room.lastMessage?.content}</p>
          {room.unreadCount > 0 && (
            <span className="badge">{room.unreadCount}</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### **Step 2: Load messages của room**
```javascript
// File: src/features/chat/hooks/useChat.js

const selectRoom = useCallback(
  async (room) => {
    // 2.1 - Set current room
    setCurrentRoom(room);
    
    // 2.2 - Load messages
    await loadMessages(room.id);
    
    // 2.3 - Mark as read
    try {
      await chatService.markAsRead(room.id);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  },
  [loadMessages]
);

const loadMessages = useCallback(async (roomId) => {
  if (!roomId) return;
  
  try {
    setLoading(true);
    const data = await chatService.getMessages(roomId, 50, 0);
    setMessages(data);
  } catch (err) {
    console.error("Error loading messages:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);
```

#### **Step 3: Get messages từ database**
```javascript
// File: src/features/chat/services/chatService.js

async getMessages(roomId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      message_reactions(id, user_id, reaction),
      reply_to_message:chat_messages!reply_to(
        id, content, sender_id, sender_type
      )
    `)
    .eq("room_id", roomId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  // Đảo ngược array để hiển thị từ cũ → mới
  return data.reverse();
}
```

**🗄️ Database Query:**
```sql
SELECT 
  cm.*,
  -- Reactions
  json_agg(DISTINCT jsonb_build_object(
    'id', mr.id,
    'user_id', mr.user_id,
    'reaction', mr.reaction
  )) FILTER (WHERE mr.id IS NOT NULL) as message_reactions,
  -- Reply to message
  json_build_object(
    'id', cm_reply.id,
    'content', cm_reply.content,
    'sender_id', cm_reply.sender_id,
    'sender_type', cm_reply.sender_type
  ) as reply_to_message
FROM chat_messages cm
LEFT JOIN message_reactions mr ON mr.message_id = cm.id
LEFT JOIN chat_messages cm_reply ON cm_reply.id = cm.reply_to
WHERE cm.room_id = 'room-uuid'
  AND cm.is_deleted = false
ORDER BY cm.created_at DESC
LIMIT 50 OFFSET 0;
```

#### **Step 4: Mark messages as read**
```javascript
// File: src/features/chat/services/chatService.js

async markAsRead(roomId) {
  try {
    // 4.1 - Lấy current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // 4.2 - Update last_read_at trong chat_participants
    await supabase
      .from("chat_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", user.id);
    
    // 4.3 - Đánh dấu notifications đã đọc
    await supabase
      .from("chat_notifications")
      .update({ is_read: true })
      .eq("room_id", roomId)
      .eq("user_id", user.id);
  } catch (error) {
    console.error("Error marking as read:", error);
    throw error;
  }
}
```

**🗄️ Database Events:**
```sql
-- Event 1: UPDATE chat_participants
UPDATE chat_participants
SET last_read_at = NOW()
WHERE room_id = 'room-uuid'
  AND user_id = 'current-user-uuid';

-- Event 2: UPDATE chat_notifications (bulk update)
UPDATE chat_notifications
SET is_read = true
WHERE room_id = 'room-uuid'
  AND user_id = 'current-user-uuid'
  AND is_read = false;
```

---

## 📋 Flow 4: Load danh sách chat rooms

### User Story
> User mở trang Chat và xem tất cả các cuộc trò chuyện

### Step-by-Step Flow

#### **Step 1: Component mount**
```javascript
// File: src/features/chat/hooks/useChat.js

export const useChat = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);
  
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getChatRooms();
      setRooms(data);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { rooms, loading, loadRooms };
};
```

#### **Step 2: Query chat rooms**
```javascript
// File: src/features/chat/services/chatService.js

async getChatRooms() {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(`
      *,
      chat_participants(user_id, user_type, last_read_at),
      rooms(id, code, name, properties(id, name, address)),
      chat_messages(
        id, content, sender_id, sender_type, 
        created_at, message_type
      )
    `)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .order("created_at", { 
      foreignTable: "chat_messages", 
      ascending: false 
    })
    .limit(1, { foreignTable: "chat_messages" });
  
  if (error) throw error;
  
  // Format data
  return data.map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    property: room.rooms?.properties,
    room: room.rooms,
    participants: room.chat_participants || [],
    lastMessage: room.chat_messages?.[0] || null,
    unreadCount: this.calculateUnreadCount(
      room.chat_participants,
      room.chat_messages
    ),
    updatedAt: room.updated_at,
    displayName: room.is_activated 
      ? room.name 
      : `${room.name} (Chờ kích hoạt)`,
    roomCode: room.room_code,
    contractId: room.contract_id
  }));
}
```

**🗄️ Database Query:**
```sql
SELECT 
  cr.*,
  -- Participants
  json_agg(DISTINCT jsonb_build_object(
    'user_id', cp.user_id,
    'user_type', cp.user_type,
    'last_read_at', cp.last_read_at
  )) as chat_participants,
  -- Room & Property info
  json_build_object(
    'id', r.id,
    'code', r.code,
    'name', r.name,
    'properties', json_build_object(
      'id', p.id,
      'name', p.name,
      'address', p.address
    )
  ) as rooms,
  -- Last message (subquery)
  (
    SELECT json_agg(json_build_object(
      'id', id,
      'content', content,
      'sender_id', sender_id,
      'sender_type', sender_type,
      'created_at', created_at,
      'message_type', message_type
    ))
    FROM (
      SELECT *
      FROM chat_messages
      WHERE room_id = cr.id
        AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT 1
    ) sub
  ) as chat_messages
FROM chat_rooms cr
LEFT JOIN chat_participants cp ON cp.room_id = cr.id
LEFT JOIN rooms r ON r.id = cr.room_id
LEFT JOIN properties p ON p.id = r.property_id
WHERE cr.is_active = true
GROUP BY cr.id, r.id, p.id
ORDER BY cr.updated_at DESC;
```

#### **Step 3: Calculate unread count**
```javascript
calculateUnreadCount(participants, messages) {
  // Tìm participant của current user
  const currentUserId = getCurrentUserId(); // Helper function
  const userParticipant = participants.find(
    p => p.user_id === currentUserId
  );
  
  if (!userParticipant) return 0;
  
  // Đếm messages sau last_read_at
  const unreadCount = messages.filter(msg => {
    return new Date(msg.created_at) > new Date(userParticipant.last_read_at);
  }).length;
  
  return unreadCount;
}
```

---

## 🔥 Các sự kiện Database

### Tổng hợp các INSERT/UPDATE/DELETE events

#### **1. Tạo phòng chat mới**
```sql
-- Transaction bắt đầu
BEGIN;

-- Insert chat_rooms
INSERT INTO chat_rooms (...) VALUES (...);

-- Insert participants (2 records)
INSERT INTO chat_participants (...) VALUES (...), (...);

-- Commit transaction
COMMIT;
```

#### **2. Gửi tin nhắn**
```sql
-- Transaction bắt đầu
BEGIN;

-- Insert message
INSERT INTO chat_messages (...) VALUES (...);

-- Update room timestamp
UPDATE chat_rooms SET updated_at = NOW() WHERE id = '...';

-- Insert notifications
INSERT INTO chat_notifications (...) VALUES (...), (...);

-- Commit transaction
COMMIT;
```

#### **3. Đọc tin nhắn**
```sql
-- Transaction bắt đầu
BEGIN;

-- Update participant last_read
UPDATE chat_participants 
SET last_read_at = NOW() 
WHERE room_id = '...' AND user_id = '...';

-- Update notifications
UPDATE chat_notifications 
SET is_read = true 
WHERE room_id = '...' AND user_id = '...';

-- Commit transaction
COMMIT;
```

#### **4. React to message**
```sql
INSERT INTO message_reactions (
  id, message_id, user_id, reaction, created_at
) VALUES (
  gen_random_uuid(), 'message-uuid', 'user-uuid', '👍', NOW()
)
ON CONFLICT (message_id, user_id, reaction) DO NOTHING;
```

#### **5. Edit message**
```sql
UPDATE chat_messages
SET 
  content = 'New content',
  is_edited = true,
  edited_at = NOW()
WHERE id = 'message-uuid'
  AND sender_id = 'current-user-uuid'; -- Security check
```

#### **6. Delete message (soft delete)**
```sql
UPDATE chat_messages
SET 
  is_deleted = true,
  deleted_at = NOW()
WHERE id = 'message-uuid'
  AND sender_id = 'current-user-uuid'; -- Security check
```

---

## 🔄 Supabase Realtime Integration

### Enable Realtime cho Mobile App

#### **1. Setup Realtime subscription**
```javascript
// Mobile App - services/chatService.js

subscribeToNewMessages(roomId, onNewMessage) {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('New message:', payload.new);
        onNewMessage(payload.new);
      }
    )
    .subscribe();
  
  return subscription;
}

// Unsubscribe khi unmount
unsubscribeFromMessages(subscription) {
  supabase.removeChannel(subscription);
}
```

#### **2. React hook cho realtime**
```javascript
// Mobile App - hooks/useRealtimeChat.js

import { useEffect } from 'react';

export const useRealtimeChat = (roomId, onNewMessage) => {
  useEffect(() => {
    if (!roomId) return;
    
    const subscription = chatService.subscribeToNewMessages(
      roomId, 
      onNewMessage
    );
    
    return () => {
      chatService.unsubscribeFromMessages(subscription);
    };
  }, [roomId, onNewMessage]);
};
```

#### **3. Usage trong component**
```javascript
// Mobile App - screens/ChatScreen.js

const ChatScreen = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  
  // Load initial messages
  useEffect(() => {
    loadMessages(roomId);
  }, [roomId]);
  
  // Subscribe to new messages
  useRealtimeChat(roomId, (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
    
    // Scroll to bottom
    scrollToBottom();
    
    // Show notification if app in background
    if (AppState.currentState !== 'active') {
      showLocalNotification(newMessage);
    }
  });
  
  return <ChatUI messages={messages} />;
};
```

#### **4. Subscribe to typing indicators**
```javascript
subscribeToTypingIndicator(roomId, onTyping) {
  const channel = supabase.channel(`typing:${roomId}`);
  
  // Send typing event
  const sendTyping = (isTyping) => {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: getCurrentUserId(), 
        isTyping 
      }
    });
  };
  
  // Listen to typing events
  channel.on('broadcast', { event: 'typing' }, (payload) => {
    onTyping(payload);
  }).subscribe();
  
  return { channel, sendTyping };
}
```

#### **5. Presence - Online status**
```javascript
trackUserPresence(roomId) {
  const channel = supabase.channel(`presence:${roomId}`);
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      console.log('Online users:', presenceState);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: getCurrentUserId(),
          online_at: new Date().toISOString()
        });
      }
    });
  
  return channel;
}
```

---

## 📊 Performance Optimization

### 1. **Indexing Strategy**
```sql
-- Chat rooms
CREATE INDEX idx_chat_rooms_updated_at ON chat_rooms(updated_at DESC);
CREATE INDEX idx_chat_rooms_property ON chat_rooms(property_id) WHERE is_active = true;

-- Messages
CREATE INDEX idx_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_messages_not_deleted ON chat_messages(room_id) WHERE is_deleted = false;

-- Participants
CREATE INDEX idx_participants_room_user ON chat_participants(room_id, user_id);
CREATE INDEX idx_participants_user_active ON chat_participants(user_id) WHERE is_active = true;

-- Notifications
CREATE INDEX idx_notifications_user_unread ON chat_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_room ON chat_notifications(room_id);
```

### 2. **Pagination**
```javascript
// Load more messages (infinite scroll)
async loadMoreMessages(roomId, offset = 0) {
  const LIMIT = 50;
  
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);
  
  if (error) throw error;
  
  return {
    messages: data.reverse(),
    hasMore: data.length === LIMIT
  };
}
```

### 3. **Caching Strategy**
```javascript
// Cache rooms list
const CACHE_KEY = 'chat_rooms_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async getChatRooms() {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  // Fetch from database
  const data = await this.fetchChatRooms();
  
  // Update cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

---

## 🔒 Security & RLS Policies

### Row Level Security Policies

```sql
-- Chat rooms: User chỉ thấy rooms mình tham gia
CREATE POLICY "Users can view their own chat rooms"
ON chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_rooms.id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.is_active = true
  )
);

-- Messages: User chỉ thấy messages trong rooms mình tham gia
CREATE POLICY "Users can view messages in their rooms"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.is_active = true
  )
);

-- Messages: User chỉ gửi được trong rooms mình tham gia
CREATE POLICY "Users can send messages in their rooms"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.is_active = true
  )
  AND chat_messages.sender_id = auth.uid()
);

-- Notifications: User chỉ thấy notifications của mình
CREATE POLICY "Users can view their own notifications"
ON chat_notifications FOR SELECT
USING (user_id = auth.uid());
```

---

## 📱 Mobile App Implementation Checklist

- [x] **Database schema** - Đã có đầy đủ
- [ ] **Copy chatService.js** từ web → mobile
- [ ] **Setup Realtime subscriptions**
  - [ ] New messages subscription
  - [ ] Typing indicators
  - [ ] Online presence
- [ ] **UI Components**
  - [ ] ChatListScreen
  - [ ] ChatScreen
  - [ ] MessageBubble
  - [ ] InputBar với emoji picker
- [ ] **Push Notifications**
  - [ ] Setup FCM/APNS
  - [ ] Link với chat_notifications table
  - [ ] Handle notification tap → navigate to chat
- [ ] **File Upload**
  - [ ] Image picker
  - [ ] File picker
  - [ ] Upload to Supabase Storage
  - [ ] Preview images in chat
- [ ] **Offline Support**
  - [ ] Cache messages locally (SQLite/Realm)
  - [ ] Queue messages when offline
  - [ ] Sync when back online
- [ ] **Additional Features**
  - [ ] Message reactions
  - [ ] Reply to message
  - [ ] Edit/delete message
  - [ ] Search messages
  - [ ] Media gallery

---

## 🎓 Summary

### Flow Chính

1. **Tạo phòng chat**: Admin search → Select tenant → Create/Get room → Add participants
2. **Gửi tin nhắn**: Type → Send → Insert message → Update room → Create notifications
3. **Nhận tin nhắn**: Select room → Load messages → Mark as read
4. **Load rooms**: Query rooms + participants + last message → Format → Display

### Database Events

- **INSERT**: chat_rooms, chat_participants, chat_messages, chat_notifications
- **UPDATE**: chat_rooms.updated_at, chat_participants.last_read_at, chat_notifications.is_read
- **SELECT**: Complex joins với participants, messages, reactions

### Key Technologies

- **Supabase**: Database + Auth + Realtime + Storage
- **React**: Web admin UI
- **React Native**: Mobile app (planned)
- **PostgreSQL**: Robust RDBMS với RLS

---

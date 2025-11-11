# 🔄 Bills Realtime Subscription Guide

## Tổng quan

Hệ thống Bills sử dụng **Supabase Realtime** để đồng bộ dữ liệu theo thời gian thực giữa nhiều users (Owner và Tenant). Khi một user tạo, sửa, hoặc xóa bill, tất cả users có quyền truy cập sẽ thấy thay đổi ngay lập tức mà không cần refresh trang.

---

## 🏗️ Kiến trúc Realtime

### 1. Cơ chế hoạt động

```
User A (Owner)              Supabase Database              User B (Tenant)
      |                            |                              |
      |--[1] CREATE bill---------->|                              |
      |                            |                              |
      |                            |--[2] RLS Policy Check------->|
      |                            |    ✅ Owner policy           |
      |                            |    ✅ Tenant policy          |
      |                            |                              |
      |<---[3] Bill created--------|                              |
      |                            |                              |
      |--[4] Postgres WAL--------->|                              |
      |                            |                              |
      |                            |--[5] Realtime Broadcast----->|
      |                            |                              |
      |    [6] Subscription        |         [7] Subscription     |
      |        receives event      |             receives event   |
      |                            |                              |
      |    [8] fetchBills()        |         [9] fetchBills()     |
      |        UI updates ✅       |             UI updates ✅    |
```

### 2. Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌────────────────────┐         ┌──────────────────────┐   │
│  │  bills.jsx (Page)  │────────▶│  useBills (Hook)     │   │
│  │  - UI Components   │         │  - State Management  │   │
│  │  - User Actions    │         │  - Realtime Sub      │   │
│  └────────────────────┘         └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Realtime Layer                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Channel: "bills-changes"                            │   │
│  │  - Listen: INSERT, UPDATE, DELETE events             │   │
│  │  - Broadcast: To all subscribed clients              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Postgres Changes
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer (RLS)                     │
│  ┌────────────────────┐         ┌──────────────────────┐   │
│  │  bills table       │         │  RLS Policies        │   │
│  │  - Data Storage    │────────▶│  - Owner Access      │   │
│  │  - Constraints     │         │  - Tenant Access     │   │
│  └────────────────────┘         └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Row Level Security (RLS) Policies

### Bills Table Policies

#### 1. Owner/Landlord Policies

```sql
-- SELECT: Owners can view bills of their properties
CREATE POLICY "Users can view bills of their properties"
ON bills FOR SELECT
USING (
  room_id IN (
    SELECT r.id 
    FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE p.owner_id = auth.uid()
  )
  AND deleted_at IS NULL
);

-- INSERT: Owners can create bills for their properties
CREATE POLICY "Users can insert bills of their properties"
ON bills FOR INSERT
WITH CHECK (
  room_id IN (
    SELECT r.id 
    FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE p.owner_id = auth.uid()
  )
);

-- UPDATE: Owners can update bills of their properties
CREATE POLICY "Users can update bills of their properties"
ON bills FOR UPDATE
USING (
  room_id IN (
    SELECT r.id 
    FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE p.owner_id = auth.uid()
  )
);

-- DELETE: Owners can delete bills of their properties
CREATE POLICY "Users can delete bills of their properties"
ON bills FOR DELETE
USING (
  room_id IN (
    SELECT r.id 
    FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE p.owner_id = auth.uid()
  )
);
```

#### 2. Tenant Policies

```sql
-- SELECT: Tenants can view their own bills
CREATE POLICY "Tenants can view their own bills"
ON bills FOR SELECT
USING (
  contract_id IN (
    SELECT c.id 
    FROM contracts c 
    WHERE c.tenant_id = auth.uid()
  )
);
```

### Payments Table Policies

```sql
-- SELECT: Tenants can view payments for their bills
CREATE POLICY "Tenants can view their own payments"
ON payments FOR SELECT
USING (
  bill_id IN (
    SELECT b.id 
    FROM bills b
    JOIN contracts c ON b.contract_id = c.id
    WHERE c.tenant_id = auth.uid()
  )
);

-- INSERT: Tenants can create payments for their bills
CREATE POLICY "Tenants can create payments for their bills"
ON payments FOR INSERT
WITH CHECK (
  bill_id IN (
    SELECT b.id 
    FROM bills b
    JOIN contracts c ON b.contract_id = c.id
    WHERE c.tenant_id = auth.uid()
  )
);
```

### Policy Matrix

| Action | Owner (Landlord) | Tenant |
|--------|------------------|--------|
| **View Bills** | ✅ All bills in their properties | ✅ Only their contract's bills |
| **Create Bills** | ✅ For their properties | ❌ No permission |
| **Update Bills** | ✅ Their property bills | ❌ No permission |
| **Delete Bills** | ✅ Their property bills | ❌ No permission |
| **View Payments** | ✅ All payments in properties | ✅ Only their bills' payments |
| **Create Payments** | ✅ For property bills | ✅ For their bills |
| **Update Payments** | ✅ Property payments | ❌ No permission |
| **Delete Payments** | ✅ Property payments | ❌ No permission |

---

## 💻 Code Implementation

### useBills Hook (src/features/bills/hooks/useBills.js)

```javascript
import { useState, useEffect } from "react";
import { billService } from "../services/billService";
import { supabase } from "../../../core/data/remote/supabase";

export const useBills = (filters = {}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bills with filters
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const billsData = await billService.getBills(filters);
      setBills(billsData);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBills();
  }, [JSON.stringify(filters)]);

  // ========================================
  // Realtime Subscription Setup
  // ========================================
  useEffect(() => {
    console.log("🔔 Setting up realtime subscription for bills...");

    const channel = supabase
      .channel("bills-changes")
      
      // Listen to INSERT events
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("➕ New bill created:", payload.new);
          // Refresh to get full data with relationships
          fetchBills();
        }
      )
      
      // Listen to UPDATE events
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("✏️ Bill updated:", payload.new);
          // Refresh to get full data with relationships
          fetchBills();
        }
      )
      
      // Listen to DELETE events
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bills",
        },
        (payload) => {
          console.log("🗑️ Bill deleted:", payload.old);
          // Remove from state immediately
          setBills((prev) => 
            prev.filter((bill) => bill.id !== payload.old.id)
          );
        }
      )
      
      // Subscribe and monitor status
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
        
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to bills realtime updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ Subscription failed - check if Realtime is enabled in Supabase Dashboard"
          );
        } else if (status === "TIMED_OUT") {
          console.error("⏱️ Subscription timed out");
        } else if (status === "CLOSED") {
          console.warn("🔒 Subscription closed");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log("🔕 Cleaning up realtime subscription...");
      supabase.removeChannel(channel);
    };
  }, []); // Only setup once

  return {
    bills,
    loading,
    error,
    refreshBills: fetchBills,
  };
};
```

---

## 🎯 Event Handling Strategy

### Why Separate Event Handlers?

```javascript
// ❌ BAD: Single wildcard event handler
.on("postgres_changes", { event: "*" }, (payload) => {
  if (payload.eventType === "INSERT") { ... }
  else if (payload.eventType === "UPDATE") { ... }
  else if (payload.eventType === "DELETE") { ... }
})

// ✅ GOOD: Separate handlers for each event
.on("postgres_changes", { event: "INSERT" }, handleInsert)
.on("postgres_changes", { event: "UPDATE" }, handleUpdate)
.on("postgres_changes", { event: "DELETE" }, handleDelete)
```

**Benefits:**
- ✅ More reliable subscription status
- ✅ Better separation of concerns
- ✅ Matches working pattern from chat feature
- ✅ Easier to debug specific event types

### INSERT & UPDATE: Why fetchBills()?

```javascript
// When receiving INSERT or UPDATE event:
.on("postgres_changes", { event: "INSERT" }, (payload) => {
  // payload.new only contains raw bill data:
  // {
  //   id: "bill-123",
  //   contract_id: "contract-456",
  //   total_amount: 5000000
  //   // ❌ NO relationships: contracts, rooms, properties, bill_items
  // }
  
  // So we fetch full data:
  fetchBills(); // ✅ Gets complete data with all relationships
});
```

**Full data structure after fetch:**
```javascript
{
  id: "bill-123",
  contract_id: "contract-456",
  total_amount: 5000000,
  contracts: {              // ← Relationship
    id: "contract-456",
    tenant_name: "Nguyễn Văn A",
    rooms: {                // ← Nested relationship
      id: "room-789",
      name: "Phòng 101",
      properties: { ... }   // ← Nested relationship
    }
  },
  bill_items: [            // ← Relationship
    { service_name: "Tiền phòng", amount: 4000000 },
    { service_name: "Tiền điện", amount: 500000 }
  ],
  payments: [...]          // ← Relationship
}
```

### DELETE: Direct State Update

```javascript
.on("postgres_changes", { event: "DELETE" }, (payload) => {
  // For DELETE, we only need the ID
  // payload.old = { id: "bill-123" }
  
  // Remove from state immediately (no need to fetch)
  setBills(prev => prev.filter(bill => bill.id !== payload.old.id));
});
```

---

## 🔄 Realtime Flow Examples

### Example 1: Owner Creates New Bill

```
Time    Owner A                    Supabase                    Tenant B
-----   ----------------------     ------------------------    -----------------------
T0      Click "Tạo hóa đơn"       
        
T1      Fill form:                
        - Room: Phòng 101
        - Amount: 5,000,000đ
        
T2      Click "Lưu"
        
T3      POST /bills -------------> INSERT INTO bills
                                    VALUES (...)
                                    
T4                                  RLS Check:
                                    - Owner policy: ✅
                                      (p.owner_id = owner_A)
                                    - Tenant policy: ✅
                                      (c.tenant_id = tenant_B)
                                    
T5      <---- Response 201         Record saved
        
T6      Local fetchBills()         Postgres WAL updated
        
T7      New bill in list ✅        Broadcast INSERT event ---> Subscription receives
                                    
T8                                                              console: "➕ New bill"
                                    
T9                                                              fetchBills()
                                    
T10                                 <---- GET /bills?filter    RLS applies
                                    
T11                                 Return filtered bills ----> New bill in list ✅
```

**Result:** Both Owner and Tenant see the new bill within ~1 second!

### Example 2: Tenant Makes Payment

```
Time    Tenant B                   Supabase                    Owner A
-----   ----------------------     ------------------------    -----------------------
T0      Views bill "HOA-2025-001"
        Status: "unpaid"
        
T1      Click "Thanh toán"
        
T2      Select payment method:
        "Chuyển khoản"
        
T3      Click "Xác nhận"
        
T4      POST /payments ----------> INSERT INTO payments
                                    VALUES (...)
                                    
T5                                  RLS Check:
                                    - Tenant policy: ✅
                                      (bill belongs to tenant)
                                    
T6      <---- Response 201         Payment saved
        
T7      Status: "paid" ✅          Trigger: Update bill
                                    SET status = 'paid'
                                    
T8                                  Broadcast UPDATE event ---> Subscription receives
                                    
T9                                                              console: "✏️ Bill updated"
                                    
T10                                                             fetchBills()
                                    
T11                                 <---- GET /bills           
                                    
T12                                 Return bills ------------> Status: "paid" ✅
```

**Result:** Owner sees bill status change to "paid" in realtime!

### Example 3: Owner Deletes Bill

```
Time    Owner A                    Supabase                    Tenant B
-----   ----------------------     ------------------------    -----------------------
T0      Click "Xóa" on bill
        
T1      Confirm deletion
        
T2      DELETE /bills/:id -------> UPDATE bills
                                    SET deleted_at = NOW()
                                    
T3                                  RLS Check:
                                    - Owner policy: ✅
                                    
T4      <---- Response 200         Soft delete completed
        
T5      Bill removed from list ✅  Broadcast DELETE event ---> Subscription receives
                                    (or UPDATE if soft delete)
                                    
T6                                                              console: "🗑️ Bill deleted"
                                    
T7                                                              setBills(filter)
                                    
T8                                                              Bill removed ✅
```

---

## 🐛 Troubleshooting

### Subscription Status: CLOSED

**Problem:**
```javascript
📡 Subscription status: CLOSED
🔒 Subscription closed
```

**Possible Causes:**

1. **❌ Realtime PUBLICATION not enabled for table** ⭐ MOST COMMON ISSUE
   
   **Check if table is in publication:**
   ```sql
   SELECT schemaname, tablename
   FROM pg_publication_tables
   WHERE tablename = 'bills' AND schemaname = 'public';
   ```
   
   **If result is empty `[]`, enable Realtime:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE bills;
   ```
   
   **Verify it's enabled:**
   ```sql
   SELECT schemaname, tablename, '✅ Enabled' as status
   FROM pg_publication_tables
   WHERE tablename = 'bills' AND schemaname = 'public';
   ```
   
   **What is PUBLICATION?**
   - PUBLICATION is a PostgreSQL feature that defines which tables broadcast changes
   - Supabase uses `supabase_realtime` publication for Realtime features
   - If table is NOT in publication → subscription connects but NO events received
   - See [PUBLICATION explanation](#-postgresql-publication-explained) below

2. **RLS blocking subscription**
   - Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'bills'`
   - Test with `auth.uid()` in SQL query

3. **Network issues**
   - Check browser console for errors
   - Verify Supabase project is not paused

### Subscription Status: CHANNEL_ERROR

**Problem:**
```javascript
📡 Subscription status: CHANNEL_ERROR
❌ Subscription failed
```

**Solution:**
- Check Supabase project status
- Verify API keys are correct
- Check if project is on free plan (has limits)

### Events Not Firing

**Problem:** Subscription shows SUBSCRIBED but no events received when creating/updating bills

**⚠️ This is THE MOST COMMON issue with Supabase Realtime!**

**Root Cause:** Table not in `supabase_realtime` PUBLICATION

**Debug Steps:**

1. **🔍 Check if PUBLICATION is enabled (DO THIS FIRST):**
   ```sql
   -- Check if bills table is in publication
   SELECT schemaname, tablename
   FROM pg_publication_tables
   WHERE tablename = 'bills' AND schemaname = 'public';
   
   -- If empty [], table is NOT broadcasting events!
   ```
   
   **Fix:**
   ```sql
   -- Enable Realtime for bills table
   ALTER PUBLICATION supabase_realtime ADD TABLE bills;
   
   -- Also enable related tables
   ALTER PUBLICATION supabase_realtime ADD TABLE payments;
   ALTER PUBLICATION supabase_realtime ADD TABLE bill_items;
   ```

2. **Check console logs:**
   ```javascript
   // Should see:
   ✅ Successfully subscribed to bills realtime updates
   
   // When creating bill (if PUBLICATION enabled):
   ➕ REALTIME: New bill created: { ... }
   ```

3. **Verify RLS policies:**
   ```sql
   -- Test if user can see bills
   SELECT * FROM bills WHERE contract_id = 'your-contract-id';
   ```

4. **Check channel name uniqueness:**
   ```javascript
   // Make sure channel name is unique per subscription
   .channel("bills-changes") // ✅ OK
   .channel(`bills-${userId}`) // ✅ Better for multi-user
   ```

### Duplicate Events

**Problem:** Same event fires multiple times

**Solution:**

```javascript
// Add duplicate check
.on("postgres_changes", { event: "INSERT" }, (payload) => {
  setBills((prev) => {
    const exists = prev.some(bill => bill.id === payload.new.id);
    if (exists) {
      console.log("⚠️ Bill already exists, skipping");
      return prev;
    }
    return [...prev, payload.new];
  });
});
```

---

## 🚀 Performance Optimization

### 1. Filtered Subscriptions (Optional)

```javascript
// Instead of subscribing to ALL bills:
.on("postgres_changes", {
  event: "INSERT",
  schema: "public",
  table: "bills",
  // No filter - gets all bills (RLS filters)
}, ...)

// Can add filter for specific property:
.on("postgres_changes", {
  event: "INSERT",
  schema: "public",
  table: "bills",
  filter: `room_id=in.(${userRoomIds.join(',')})`, // ← Filter at subscription level
}, ...)
```

**Trade-offs:**
- ✅ Less network traffic
- ✅ Faster processing
- ❌ More complex code
- ❌ Need to track user's room IDs

**Recommendation:** Let RLS handle filtering (simpler, more maintainable)

### 2. Debounced Fetch

```javascript
import { debounce } from "lodash";

const debouncedFetch = useCallback(
  debounce(() => fetchBills(), 500),
  []
);

.on("postgres_changes", { event: "INSERT" }, () => {
  debouncedFetch(); // Wait 500ms before fetching
});
```

**Use case:** When multiple bills are created rapidly

### 3. Optimistic Updates

```javascript
.on("postgres_changes", { event: "INSERT" }, (payload) => {
  // Add immediately to state (optimistic)
  setBills(prev => [payload.new, ...prev]);
  
  // Then fetch full data in background
  fetchBills();
});
```

**Trade-offs:**
- ✅ Instant UI update
- ❌ May show incomplete data temporarily
- ❌ Need to handle conflicts

---

## 📊 Monitoring & Logging

### Production Logging Setup

```javascript
// src/utils/realtimeLogger.js
export const realtimeLogger = {
  subscription: (status, channel) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (e.g., Sentry, LogRocket)
      analytics.track('realtime_subscription', { status, channel });
    } else {
      console.log(`📡 [${channel}] Subscription status:`, status);
    }
  },
  
  event: (eventType, payload) => {
    if (process.env.NODE_ENV === 'production') {
      analytics.track('realtime_event', { eventType, recordId: payload.new?.id });
    } else {
      console.log(`🔔 [${eventType}] Event received:`, payload);
    }
  }
};

// Usage in useBills:
.subscribe((status) => {
  realtimeLogger.subscription(status, 'bills-changes');
});
```

### Metrics to Track

1. **Subscription Health**
   - Time to SUBSCRIBED status
   - Number of CLOSED/ERROR events
   - Reconnection attempts

2. **Event Processing**
   - Event latency (time from DB change to UI update)
   - Number of events per session
   - Failed event handlers

3. **User Experience**
   - Percentage of users with active subscriptions
   - Average time to see realtime updates
   - Number of manual refreshes

---

## 🎓 Best Practices

### DO ✅

1. **Use separate event handlers**
   ```javascript
   .on("postgres_changes", { event: "INSERT" }, handleInsert)
   .on("postgres_changes", { event: "UPDATE" }, handleUpdate)
   .on("postgres_changes", { event: "DELETE" }, handleDelete)
   ```

2. **Cleanup subscriptions**
   ```javascript
   useEffect(() => {
     const channel = supabase.channel('bills-changes')...
     return () => supabase.removeChannel(channel);
   }, []);
   ```

3. **Handle all subscription statuses**
   ```javascript
   .subscribe((status) => {
     switch(status) {
       case "SUBSCRIBED": // Success
       case "CHANNEL_ERROR": // Error
       case "TIMED_OUT": // Timeout
       case "CLOSED": // Closed
     }
   });
   ```

4. **Fetch full data for complex relationships**
   ```javascript
   .on("postgres_changes", { event: "INSERT" }, () => {
     fetchBills(); // Gets full data with relationships
   });
   ```

### DON'T ❌

1. **Don't use wildcard events**
   ```javascript
   // ❌ BAD
   .on("postgres_changes", { event: "*" }, ...)
   ```

2. **Don't forget to cleanup**
   ```javascript
   // ❌ BAD - Memory leak
   useEffect(() => {
     supabase.channel('bills').subscribe();
     // No cleanup!
   }, []);
   ```

3. **Don't rely on payload for complex data**
   ```javascript
   // ❌ BAD - Missing relationships
   .on("postgres_changes", { event: "INSERT" }, (payload) => {
     setBills(prev => [...prev, payload.new]); // Incomplete data!
   });
   ```

4. **Don't create multiple channels for same table**
   ```javascript
   // ❌ BAD - Duplicate subscriptions
   supabase.channel('bills-1').on(...).subscribe();
   supabase.channel('bills-2').on(...).subscribe();
   ```

---

## � PostgreSQL PUBLICATION Explained

### What is PUBLICATION?

**PUBLICATION** is a PostgreSQL feature that defines **which tables can broadcast changes** through Logical Replication.

```
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                           │
│                                                              │
│  Write-Ahead Log (WAL)                                      │
│  - Records ALL database changes                             │
│         ↓                                                    │
│  Logical Replication Slot                                   │
│  - Decodes WAL into logical changes                         │
│         ↓                                                    │
│  PUBLICATION (Filter) ⭐                                     │
│  ┌────────────────────────────────────────────┐            │
│  │ supabase_realtime PUBLICATION              │            │
│  │ - bills         ✅ Broadcasts events       │            │
│  │ - payments      ✅ Broadcasts events       │            │
│  │ - bill_items    ✅ Broadcasts events       │            │
│  │ - users         ❌ NOT broadcasting        │            │
│  │ - contracts     ❌ NOT broadcasting        │            │
│  └────────────────────────────────────────────┘            │
│         ↓                                                    │
│  Supabase Realtime Server                                   │
│  - Receives ONLY published table changes                    │
│  - Broadcasts to WebSocket clients                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **PUBLICATION = Whitelist of tables**
   - Only tables in publication can broadcast Realtime events
   - Even if subscription connects, no events if table not in publication

2. **Supabase uses `supabase_realtime` publication**
   ```sql
   -- Check what tables are published
   SELECT schemaname, tablename
   FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

3. **Add table to publication:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE bills;
   ```

4. **Remove table from publication:**
   ```sql
   ALTER PUBLICATION supabase_realtime DROP TABLE bills;
   ```

### PUBLICATION vs RLS

Two different security layers:

| Layer | Purpose | Controls |
|-------|---------|----------|
| **PUBLICATION** | Database-level filter | Which tables can broadcast? |
| **RLS (Row Level Security)** | Row-level filter | Which users see which rows? |

**Example Flow:**

```
User A creates bill
       ↓
[1] Check PUBLICATION
    ✅ Is "bills" in supabase_realtime?
    → YES → Continue
    → NO → STOP (no broadcast)
       ↓
[2] Broadcast event to Realtime Server
       ↓
[3] Client subscriptions receive event
       ↓
[4] RLS Filter (per client):
    User A: ✅ Owns property → receives event
    User B: ✅ Is tenant → receives event  
    User C: ❌ No access → blocked by RLS
```

### Common Commands

**Check if table is published:**
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE tablename = 'bills' AND schemaname = 'public';
-- Empty result = NOT published
```

**Enable Realtime for table:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
```

**Enable for multiple tables:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE bill_items;
```

**Verify all published tables:**
```sql
SELECT schemaname, tablename, '✅ Realtime enabled' as status
FROM pg_publication_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Why This Matters

**❌ Without PUBLICATION:**
```
✅ Subscription connects (status: SUBSCRIBED)
❌ Database doesn't broadcast events
❌ No events received in frontend
😕 Confusing: "Why is it connected but not working?"
```

**✅ With PUBLICATION:**
```
✅ Subscription connects (status: SUBSCRIBED)
✅ Database broadcasts events
✅ Events received in frontend
😃 Realtime works perfectly!
```

### StayMate Project Setup

**Enabled tables:**
```sql
-- Already enabled for this project:
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE bill_items;
```

**Verification:**
```sql
SELECT tablename
FROM pg_publication_tables
WHERE tablename IN ('bills', 'payments', 'bill_items')
  AND schemaname = 'public';
  
-- Result:
-- bill_items  ✅
-- bills       ✅
-- payments    ✅
```

---

## �🔗 Related Documentation

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [PostgreSQL Publications](https://www.postgresql.org/docs/current/sql-createpublication.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Chat Feature Realtime Implementation](../chat/hooks/useChat.js)

---

## 📝 Summary

### Key Takeaways

1. **PUBLICATION must be enabled** - Table must be in `supabase_realtime` publication to broadcast events
2. **Realtime works automatically** - Both Owner and Tenant receive updates without additional code
3. **RLS handles security** - Database policies ensure users only see their own data
4. **Separate event handlers** - More reliable than wildcard events
5. **Fetch full data** - For INSERT/UPDATE to get complete relationships
6. **Direct state update** - For DELETE since we only need the ID

### Quick Reference

**1. Enable PUBLICATION first (one-time setup):**
```sql
-- Enable Realtime for bills table
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE bill_items;

-- Verify
SELECT tablename FROM pg_publication_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**2. Frontend subscription code:**
```javascript
// Minimal working example:
useEffect(() => {
  const channel = supabase
    .channel("bills-changes")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "bills" }, 
        () => fetchBills())
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bills" }, 
        () => fetchBills())
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "bills" }, 
        (payload) => setBills(prev => prev.filter(b => b.id !== payload.old.id)))
    .subscribe((status) => console.log("📡", status));

  return () => supabase.removeChannel(channel);
}, []);
```

**3. Troubleshooting checklist:**
- [ ] Table in PUBLICATION? `SELECT * FROM pg_publication_tables WHERE tablename = 'bills'`
- [ ] Subscription connected? Look for `status: SUBSCRIBED` in console
- [ ] RLS policies exist? `SELECT * FROM pg_policies WHERE tablename = 'bills'`
- [ ] Events firing? Look for `➕ REALTIME: New bill created` in console

---

**Last Updated:** November 1, 2025  
**Version:** 1.1 (Added PUBLICATION documentation)  
**Maintainer:** StayMate Development Team

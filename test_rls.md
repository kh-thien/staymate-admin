# Test Row Level Security (RLS)

## 🔍 **Cách kiểm tra RLS hoạt động:**

### 1. **Kiểm tra trong Supabase Dashboard:**
```sql
-- Chạy query này trong SQL Editor của Supabase
-- Kết quả sẽ chỉ hiển thị dữ liệu của user hiện tại
SELECT * FROM properties;
SELECT * FROM rooms;
SELECT * FROM contracts;
SELECT * FROM bills;
```

### 2. **Kiểm tra trong ứng dụng:**
- Đăng nhập với User A → Chỉ thấy dữ liệu của User A
- Đăng nhập với User B → Chỉ thấy dữ liệu của User B

### 3. **Debug trong Console:**
```javascript
// Thêm vào useDashboard.js để debug
console.log('Current userId:', userId);
console.log('Properties count:', propertiesCount);
console.log('Rooms count:', roomsCount);
```

## 🚨 **Nếu RLS chưa hoạt động:**

### 1. **Kiểm tra RLS đã được bật:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'rooms', 'tenants', 'contracts', 'bills');
```

### 2. **Kiểm tra Policies:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. **Test RLS với user khác nhau:**
```sql
-- Chạy với user A
SELECT auth.uid(); -- Sẽ trả về ID của user A

-- Chạy với user B  
SELECT auth.uid(); -- Sẽ trả về ID của user B
```

## ✅ **Kết quả mong đợi:**

- **User A** chỉ thấy: Properties, Rooms, Contracts, Bills của User A
- **User B** chỉ thấy: Properties, Rooms, Contracts, Bills của User B
- **Không có dữ liệu chung** giữa các user

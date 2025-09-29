# Test Chức năng Xóa Property

## 🔍 **Các bước kiểm tra:**

### 1. **Test UI xóa:**
- [ ] Click nút "Xóa" trên PropertyCard
- [ ] Click nút "Xóa" trên PropertiesTable
- [ ] Xác nhận dialog hiển thị: "Bạn có chắc chắn muốn xóa nhà trọ này?"

### 2. **Test logic xóa:**
- [ ] Property bị xóa khỏi danh sách ngay lập tức
- [ ] Hiển thị thông báo: "Xóa nhà trọ thành công!"
- [ ] Property không còn hiển thị trong danh sách

### 3. **Test database:**
```sql
-- Kiểm tra property đã bị soft delete
SELECT id, name, is_active, updated_at 
FROM properties 
WHERE id = 'property_id_đã_xóa';

-- Kết quả mong đợi: is_active = false
```

### 4. **Test RLS (nếu đã thiết lập):**
- [ ] User A không thể xóa properties của User B
- [ ] User A chỉ thấy properties của chính họ sau khi xóa

## 🚨 **Các lỗi có thể gặp:**

### 1. **Lỗi RLS:**
```
Error: new row violates row-level security policy
```
**Giải pháp:** Kiểm tra RLS policies trong Supabase

### 2. **Lỗi Foreign Key:**
```
Error: update or delete on table "properties" violates foreign key constraint
```
**Giải pháp:** Xóa các bản ghi liên quan trước (rooms, contracts, bills)

### 3. **Lỗi Permission:**
```
Error: permission denied for table properties
```
**Giải pháp:** Kiểm tra quyền của user trong Supabase

## ✅ **Kết quả mong đợi:**

1. **UI:** Property biến mất khỏi danh sách
2. **Database:** `is_active = false`
3. **UX:** Thông báo thành công
4. **Security:** Chỉ xóa được properties của user hiện tại

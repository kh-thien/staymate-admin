# Phân Tích Logic Xóa - Hợp Đồng, Người Thuê, Phòng, Nhà Trọ

## 📋 Logic Hiện Tại

### 1. **Xóa Hợp Đồng (Contract)**

**Điều kiện cho phép xóa:**
- ✅ Không có hóa đơn chưa thanh toán (UNPAID hoặc OVERDUE)
- ✅ Nếu ACTIVE: Phải đã hết hạn (end_date <= today)
- ✅ Nếu EXPIRED hoặc TERMINATED: Có thể xóa (nếu không có hóa đơn chưa thanh toán)

**Khi xóa:**
- Chỉ soft delete (set `deleted_at`)
- ❌ KHÔNG tự động update tenant ra khỏi phòng
- ❌ KHÔNG tự động update room status thành VACANT

**Vấn đề:**
- Nếu còn hóa đơn chưa thanh toán → KHÔNG thể xóa
- Sau khi xóa hợp đồng, tenant vẫn còn trong phòng (room_id vẫn còn)
- Phòng vẫn hiển thị OCCUPIED

---

### 2. **Xóa Người Thuê (Tenant)**

**Điều kiện cho phép xóa:**
- ✅ Phải đã chuyển ra khỏi phòng (`active_in_room = false`)
- ✅ Không có hợp đồng ACTIVE đang hoạt động

**Khi xóa:**
- Soft delete (set `deleted_at`, `is_active = false`)

**Logic:** ✅ ĐÚNG

---

### 3. **Xóa Phòng (Room)**

**Điều kiện cho phép xóa:**
- ❌ Không có người thuê đang ở (`active_in_room = true`)
- ❌ Không có hợp đồng ACTIVE
- ❌ Không có hóa đơn chưa thanh toán (UNPAID, PARTIALLY_PAID, OVERDUE)

**Vấn đề:**
- Nếu còn hợp đồng TERMINATED/EXPIRED → Vẫn không thể xóa
- Nếu còn hóa đơn đã thanh toán → Vẫn không thể xóa (logic này có thể không cần thiết)

---

### 4. **Xóa Nhà Trọ (Property)**

**Điều kiện cho phép xóa:**
- ❌ Không có phòng nào có người thuê đang ở
- ❌ Không có hợp đồng ACTIVE
- ❌ Không có hóa đơn chưa thanh toán (UNPAID, PARTIALLY_PAID, OVERDUE)

**Vấn đề:**
- Tương tự như xóa phòng, điều kiện có thể quá nghiêm ngặt

---

## 💡 Logic Đề Xuất (Theo Yêu Cầu)

### 1. **Xóa Hợp Đồng**

**Điều kiện cho phép xóa:**
- ✅ **Cho phép xóa dù còn hóa đơn chưa thanh toán** (có thể xóa hóa đơn sau)

**Khi xóa hợp đồng:**
- ✅ Tự động update tenant:
  - `room_id = NULL`
  - `active_in_room = false`
- ✅ Tự động update room:
  - `status = 'VACANT'`
  - `current_occupants = current_occupants - 1`

**Cách thực hiện:**
- Tạo trigger `BEFORE UPDATE` trên `contracts` table
- Khi `deleted_at` được set (từ NULL → có giá trị), trigger sẽ:
  1. Update tenant ra khỏi phòng
  2. Update room thành VACANT

---

### 2. **Xóa Người Thuê**

**Logic:** ✅ Giữ nguyên (đã đúng)
- Chỉ cho phép xóa khi `active_in_room = false`

---

### 3. **Xóa Phòng**

**Điều kiện cho phép xóa:**
- ✅ **Chỉ cần kiểm tra: Không có người ở (`active_in_room = true`)**
- ❌ Bỏ kiểm tra contracts
- ❌ Bỏ kiểm tra bills

**Lý do:**
- Nếu phòng trống (không có người ở) → Có thể xóa
- Hóa đơn và hợp đồng cũ có thể vẫn tồn tại (lịch sử)

---

### 4. **Xóa Nhà Trọ**

**Điều kiện cho phép xóa:**
- ✅ **Chỉ cần kiểm tra: Tất cả phòng trong nhà trọ không có người ở**
- ❌ Bỏ kiểm tra contracts
- ❌ Bỏ kiểm tra bills

**Lý do:**
- Nếu tất cả phòng đều trống → Có thể xóa nhà trọ
- Hóa đơn và hợp đồng cũ có thể vẫn tồn tại (lịch sử)

---

## 🔄 Flow Đề Xuất

### **Scenario 1: Xóa Hợp Đồng**
```
1. User xóa hợp đồng (dù còn hóa đơn chưa thanh toán)
   ↓
2. Trigger tự động:
   - Update tenant: room_id = NULL, active_in_room = false
   - Update room: status = VACANT, current_occupants - 1
   ↓
3. Hóa đơn vẫn tồn tại (có thể xóa sau)
   ↓
4. Phòng trống → Có thể xóa phòng
```

### **Scenario 2: Xóa Phòng**
```
1. User muốn xóa phòng
   ↓
2. Kiểm tra: Có người ở không? (active_in_room = true)
   ↓
3. Nếu KHÔNG có người ở → Cho phép xóa
   ↓
4. Xóa phòng (soft delete)
```

### **Scenario 3: Xóa Nhà Trọ**
```
1. User muốn xóa nhà trọ
   ↓
2. Kiểm tra: Tất cả phòng trong nhà trọ có người ở không?
   ↓
3. Nếu TẤT CẢ phòng đều KHÔNG có người ở → Cho phép xóa
   ↓
4. Xóa nhà trọ (soft delete) + Xóa tất cả phòng (soft delete)
```

---

## ✅ Tóm Tắt So Sánh

| Hành động | Logic Hiện Tại | Logic Đề Xuất |
|-----------|----------------|---------------|
| **Xóa Hợp Đồng** | ❌ Không cho xóa nếu còn hóa đơn<br>❌ Không tự động update tenant/room | ✅ Cho phép xóa dù còn hóa đơn<br>✅ Tự động update tenant ra khỏi phòng<br>✅ Tự động update room thành VACANT |
| **Xóa Người Thuê** | ✅ Chỉ khi active_in_room = false | ✅ Giữ nguyên (đã đúng) |
| **Xóa Phòng** | ❌ Kiểm tra: tenants + contracts + bills | ✅ Chỉ kiểm tra: không có người ở |
| **Xóa Nhà Trọ** | ❌ Kiểm tra: active rooms + contracts + bills | ✅ Chỉ kiểm tra: tất cả phòng không có người ở |

---

## 🎯 Lợi Ích Của Logic Đề Xuất

1. **Linh hoạt hơn:**
   - Có thể xóa hợp đồng dù còn hóa đơn (xử lý sau)
   - Có thể xóa phòng/nhà trọ khi trống (bất kể lịch sử)

2. **Tự động hóa:**
   - Khi xóa hợp đồng → Tự động giải phóng phòng
   - Không cần thao tác thủ công

3. **Dữ liệu lịch sử:**
   - Giữ lại hóa đơn và hợp đồng cũ (để báo cáo, kiểm toán)
   - Chỉ cần kiểm tra trạng thái hiện tại (có người ở không)

4. **Logic rõ ràng:**
   - Phòng trống = Có thể xóa
   - Nhà trọ không có người ở = Có thể xóa

---

## ⚠️ Lưu Ý

1. **Hóa đơn chưa thanh toán:**
   - Sau khi xóa hợp đồng, hóa đơn vẫn tồn tại
   - Cần có cơ chế để xử lý/xóa hóa đơn sau
   - Hoặc đánh dấu hóa đơn là "CANCELLED" khi xóa hợp đồng

2. **Trigger xử lý:**
   - Cần đảm bảo trigger chạy đúng thứ tự
   - Tránh xung đột với các trigger khác

3. **Data Integrity:**
   - Đảm bảo `current_occupants` luôn chính xác
   - Đảm bảo `room.status` luôn đồng bộ với `active_in_room`

---

## 📝 Các Thay Đổi Cần Thiết (Nếu Áp Dụng)

### Database:
1. ✅ Tạo trigger `handle_contract_deleted()` để tự động update tenant và room khi xóa hợp đồng
2. ✅ Cập nhật function `can_delete_room()`: Chỉ kiểm tra `active_in_room`
3. ✅ Cập nhật function `can_delete_property()`: Chỉ kiểm tra tất cả phòng không có người ở

### Frontend:
1. ✅ Cập nhật `canDeleteContract()`: Cho phép xóa dù còn hóa đơn
2. ✅ Cập nhật UI: Hiển thị cảnh báo về hóa đơn chưa thanh toán (nhưng vẫn cho phép xóa)
3. ✅ Cập nhật thông báo: Thông báo về việc tự động update tenant và room

---

## ❓ Câu Hỏi Cần Xác Nhận

1. **Hóa đơn chưa thanh toán:**
   - Sau khi xóa hợp đồng, hóa đơn sẽ được xử lý như thế nào?
   - Tự động đánh dấu CANCELLED?
   - Vẫn giữ lại để xử lý sau?

2. **Hợp đồng TERMINATED/EXPIRED:**
   - Khi xóa hợp đồng đã TERMINATED/EXPIRED, có cần update tenant/room không?
   - (Vì có thể đã được xử lý bởi trigger `handle_contract_terminated`)

3. **Xóa hàng loạt:**
   - Có cần hỗ trợ xóa nhiều hợp đồng cùng lúc không?

---

## 🚀 Kết Luận

Logic đề xuất **hợp lý và linh hoạt hơn** so với logic hiện tại:
- ✅ Cho phép xóa hợp đồng dù còn hóa đơn (xử lý sau)
- ✅ Tự động giải phóng phòng khi xóa hợp đồng
- ✅ Đơn giản hóa điều kiện xóa phòng/nhà trọ (chỉ kiểm tra có người ở)

**Đề xuất:** Áp dụng logic mới để cải thiện trải nghiệm người dùng và tự động hóa quy trình.


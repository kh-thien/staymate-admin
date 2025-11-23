# 📊 Phân Tích Dashboard

**Ngày:** 2024  
**Vấn đề:** Logic các card và hiển thị hoạt động gần đây

---

## 🔍 Phân Tích Logic Các Card

### 1. Properties Stats ✅

**Logic:** `getPropertiesStats()`
- Đếm tổng số properties: `COUNT(*) WHERE owner_id = userId`
- Đếm active: `COUNT(*) WHERE owner_id = userId AND is_active = true`

**✅ Đúng:** Logic đúng, sử dụng `is_active` field

### 2. Rooms Stats ✅

**Logic:** `getRoomsStats()`
- Lấy tất cả rooms của user's properties
- Đếm theo `status`: OCCUPIED, VACANT

**✅ Đúng:** Logic đúng, filter theo property_id

### 3. Tenants Stats ✅

**Logic:** `getTenantsStats()`
- Lấy tenants qua rooms → properties
- Đếm theo `is_active`

**✅ Đúng:** Logic đúng, filter qua room_id

### 4. Contracts Stats ✅

**Logic:** `getContractsStats()`
- Lấy contracts qua rooms → properties
- Đếm theo `status`: ACTIVE

**✅ Đúng:** Logic đúng

### 5. Revenue Stats ⚠️

**Logic:** `getRevenueStats()`
- Lấy bills với `status = PAID`
- Tính tổng từ `total_amount`
- Tính monthly revenue từ `created_at`

**⚠️ Vấn đề:**
- Sử dụng `created_at` để tính monthly revenue
- Nên sử dụng `period_start` hoặc `period_end` thay vì `created_at`
- `created_at` là ngày tạo bill, không phải ngày thu tiền

**Nên sửa:**
```javascript
// Thay vì:
.filter((bill) => {
  const billDate = new Date(bill.created_at);
  return billDate.getMonth() === currentMonth;
})

// Nên:
.filter((bill) => {
  const billDate = new Date(bill.period_start || bill.created_at);
  return billDate.getMonth() === currentMonth;
})
```

### 6. Occupancy Rate ✅

**Logic:** `getOccupancyRate()`
- Tính từ rooms stats: `(occupied / total) * 100`

**✅ Đúng:** Logic đúng

---

## 🔴 Vấn Đề: Recent Activities

### Vấn Đề Hiện Tại:

1. **Hiển thị ID thay vì tên:**
   - "Created contracts with ID: 06584e25-a824-4e8d-b7cb-bc8c8b2f2c63"
   - "Updated properties with ID: 0f0af2ff-081d-41c0-87a2-fd4f12af98d2"

2. **Description không thân thiện:**
   - Chỉ có ID, không có tên thực tế
   - Không biết contract nào, property nào

### Giải Pháp:

1. **Join với các bảng liên quan để lấy tên:**
   - Contracts → `contract_number`
   - Properties → `name`
   - Rooms → `code` hoặc `name`
   - Tenants → `full_name`

2. **Tạo description thân thiện:**
   - "Tạo hợp đồng HD-001"
   - "Cập nhật bất động sản ABC"
   - "Tạo phòng P101"

---

## ✅ Cần Sửa

### 1. Revenue Stats - Sửa Logic Tính Monthly Revenue

**File:** `services/dashboardService.js`

**Vấn đề:** Sử dụng `created_at` thay vì `period_start`

**Sửa:**
```javascript
// Sửa từ created_at sang period_start
const monthlyRevenue = (billsData || [])
  .filter((bill) => {
    const billDate = new Date(bill.period_start || bill.created_at);
    return (
      billDate.getMonth() === currentMonth &&
      billDate.getFullYear() === currentYear
    );
  })
```

### 2. Recent Activities - Join Và Lấy Tên Thực Tế

**File:** `services/dashboardService.js`

**Sửa:** `getRecentActivities()` để join với các bảng và lấy tên

### 3. Recent Activity Component - Hiển Thị Tên Thân Thiện

**File:** `components/RecentActivity.jsx`

**Sửa:** Hiển thị tên thực tế thay vì ID

---

## 📝 Tóm Tắt

### ✅ Đúng:
- Properties stats
- Rooms stats
- Tenants stats
- Contracts stats
- Occupancy rate

### ⚠️ Cần Sửa:
- Revenue stats: Sử dụng `period_start` thay vì `created_at`
- Recent activities: Hiển thị tên thực tế thay vì ID


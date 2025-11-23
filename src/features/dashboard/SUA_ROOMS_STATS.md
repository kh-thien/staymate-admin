# 🔧 Đã Sửa Logic Đếm Phòng

**Ngày:** 2024  
**Vấn đề:** Thiếu 2 phòng trong hiển thị dashboard

---

## 🔴 Vấn Đề

### Hiển Thị:
- Tổng số phòng: **17**
- 7 có người, 8 trống
- **Thiếu 2 phòng!** (7 + 8 = 15, không bằng 17)

### Nguyên Nhân:
- Logic chỉ đếm **OCCUPIED** và **VACANT**
- Không đếm **MAINTENANCE** và **DEPOSITED**
- Hiển thị chỉ hiển thị 2 status, không hiển thị đầy đủ

### Từ Database:
```
VACANT: 11
OCCUPIED: 8
MAINTENANCE: 1
DEPOSITED: 1
Total: 21 (hoặc 17 sau khi filter theo user)
```

---

## ✅ Đã Sửa

### 1. Sửa Logic Đếm (`getRoomsStats()`)

**File:** `services/dashboardService.js`

**Trước:**
```javascript
const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
const vacant = rooms.filter((r) => r.status === "VACANT").length;

return {
  total,
  occupied,
  vacant,
};
```

**Sau:**
```javascript
const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
const vacant = rooms.filter((r) => r.status === "VACANT").length;
const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;
const deposited = rooms.filter((r) => r.status === "DEPOSITED").length;

return {
  total,
  occupied,
  vacant,
  maintenance,
  deposited,
};
```

### 2. Sửa Hiển Thị (`dashboard.jsx`)

**Trước:**
```javascript
subtitle={`${rooms?.occupied || 0} có người, ${rooms?.vacant || 0} trống`}
```

**Sau:**
```javascript
subtitle={`${rooms?.occupied || 0} có người, ${rooms?.vacant || 0} trống${(rooms?.maintenance || 0) > 0 ? `, ${rooms.maintenance} đang bảo trì` : ""}${(rooms?.deposited || 0) > 0 ? `, ${rooms.deposited} đã đặt cọc` : ""}`}
```

### 3. Sửa Hook State

**File:** `hooks/useDashboard.js`

**Trước:**
```javascript
rooms: { total: 0, occupied: 0, vacant: 0 },
```

**Sau:**
```javascript
rooms: { total: 0, occupied: 0, vacant: 0, maintenance: 0, deposited: 0 },
```

### 4. Thêm Filter `deleted_at`

**File:** `services/dashboardService.js`

**Thêm:**
```javascript
.is("deleted_at", null)
```

Để không đếm phòng đã xóa.

---

## 📊 Kết Quả

### Trước:
- ❌ Tổng: 17
- ❌ Hiển thị: "7 có người, 8 trống" (chỉ 15 phòng)
- ❌ Thiếu 2 phòng (MAINTENANCE và DEPOSITED)

### Sau:
- ✅ Tổng: 17
- ✅ Hiển thị: "7 có người, 8 trống, 1 đang bảo trì, 1 đã đặt cọc" (đủ 17 phòng)
- ✅ Đầy đủ tất cả status

---

## ✅ Files Đã Sửa

1. **`services/dashboardService.js`**
   - ✅ Thêm đếm `maintenance` và `deposited`
   - ✅ Thêm filter `deleted_at`
   - ✅ Return đầy đủ các status

2. **`hooks/useDashboard.js`**
   - ✅ Cập nhật state để bao gồm `maintenance` và `deposited`

3. **`pages/dashboard.jsx`**
   - ✅ Hiển thị đầy đủ các status trong subtitle

---

## 🎯 Các Status Của Phòng

1. **OCCUPIED** - Đã thuê
2. **VACANT** - Trống
3. **MAINTENANCE** - Đang bảo trì
4. **DEPOSITED** - Đã đặt cọc

Tất cả các status đều được đếm và hiển thị đầy đủ!

---

**Đã sửa xong! Bây giờ hiển thị đúng tổng số phòng.**


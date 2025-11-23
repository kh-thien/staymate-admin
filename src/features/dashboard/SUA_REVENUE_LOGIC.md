# 🔧 Đã Sửa Logic Doanh Thu

**Ngày:** 2024  
**Vấn đề:** Logic doanh thu không đúng - thiếu field `period_start` trong select

---

## 🔴 Vấn Đề Phát Hiện

### 1. **getRevenueStats()** - Thiếu Field `period_start`

**Vấn đề:**
- Dòng 217: Chỉ select `total_amount, status, created_at`
- Dòng 238: Code cố gắng dùng `bill.period_start` nhưng field này **KHÔNG được select**
- Kết quả: `bill.period_start` sẽ là `undefined`, code fallback về `created_at`
- **Logic sai!** Doanh thu tháng này sẽ tính theo `created_at` thay vì `period_start`

**Từ SQL Test:**
- Doanh thu tháng này theo `period_start`: **10,887,070 VNĐ** (2 bills) ✅ ĐÚNG
- Doanh thu tháng này theo `created_at`: **45,039,971 VNĐ** (9 bills) ❌ SAI

### 2. **getRevenueTrend()** - Đã đúng

- Đã select `period_start` ✅
- Logic grouping đúng ✅

### 3. **Thiếu Filter `deleted_at`**

- Cả 2 functions đều không filter `deleted_at`
- Có thể đếm cả bills đã xóa

---

## ✅ Đã Sửa

### 1. Sửa `getRevenueStats()`

**File:** `services/dashboardService.js`

**Trước:**
```javascript
const { data: billsData, error: billsError } = await supabase
  .from("bills")
  .select("total_amount, status, created_at")
  .in("room_id", roomIds)
  .eq("status", "PAID");
```

**Sau:**
```javascript
const { data: billsData, error: billsError } = await supabase
  .from("bills")
  .select("total_amount, period_start, created_at, status")
  .in("room_id", roomIds)
  .eq("status", "PAID")
  .is("deleted_at", null);
```

**Lợi ích:**
- ✅ Select `period_start` - có thể dùng cho monthly revenue
- ✅ Filter `deleted_at` - không đếm bills đã xóa

### 2. Sửa `getRevenueTrend()`

**File:** `services/dashboardService.js`

**Thêm:**
```javascript
.is("deleted_at", null)
```

**Lợi ích:**
- ✅ Không đếm bills đã xóa trong biểu đồ

---

## 📊 Logic Doanh Thu

### Tổng Doanh Thu (Total Revenue)

**Logic:**
- Lấy tất cả bills với `status = PAID`
- Tính tổng `total_amount`
- **Không filter theo thời gian** (tất cả thời gian)

**Code:**
```javascript
const totalRevenue = (billsData || []).reduce(
  (sum, bill) => sum + (parseFloat(bill.total_amount) || 0),
  0
);
```

✅ **Đúng**

### Doanh Thu Tháng Này (Monthly Revenue)

**Logic:**
- Lấy bills với `status = PAID`
- Filter theo tháng hiện tại
- **Sử dụng `period_start`** (ngày thu tiền thực tế)
- Fallback về `created_at` nếu không có `period_start`

**Code:**
```javascript
const monthlyRevenue = (billsData || [])
  .filter((bill) => {
    const billDate = new Date(bill.period_start || bill.created_at);
    return (
      billDate.getMonth() === currentMonth &&
      billDate.getFullYear() === currentYear
    );
  })
  .reduce((sum, bill) => sum + (parseFloat(bill.total_amount) || 0), 0);
```

✅ **Đúng** (sau khi sửa)

### Biểu Đồ Doanh Thu 6 Tháng (Revenue Trend)

**Logic:**
- Lấy bills với `status = PAID`
- Filter từ 6 tháng trước đến hiện tại
- Group theo tháng dựa trên `period_start`
- Tính tổng doanh thu mỗi tháng

**Code:**
```javascript
const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

const { data } = await supabase
  .from("bills")
  .select("total_amount, period_start, created_at, status")
  .in("room_id", roomIds)
  .eq("status", "PAID")
  .gte("period_start", startDate.toISOString());

// Group by month
(data || []).forEach((bill) => {
  const date = new Date(bill.period_start || bill.created_at);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  // ... group và tính tổng
});
```

✅ **Đúng**

---

## 🎯 Hiển Thị

### Cards

**Tổng doanh thu:**
```jsx
<StatsCard
  title="Tổng doanh thu"
  value={`${(revenue?.totalRevenue || 0).toLocaleString("vi-VN")} VNĐ`}
/>
```

✅ **Chuẩn** - Format tiền Việt Nam

**Doanh thu tháng này:**
```jsx
<StatsCard
  title="Doanh thu tháng này"
  value={`${(revenue?.monthlyRevenue || 0).toLocaleString("vi-VN")} VNĐ`}
/>
```

✅ **Chuẩn** - Format tiền Việt Nam

### Biểu Đồ

**RevenueChart Component:**
- Sử dụng AreaChart từ Recharts ✅
- Format tooltip: `toLocaleString("vi-VN")` ✅
- Format Y-axis: `${(value / 1000000).toFixed(1)}M` ✅
- Empty state khi không có dữ liệu ✅
- Loading state ✅

✅ **Chuẩn**

---

## 📝 Tóm Tắt

### Trước:
- ❌ `getRevenueStats()` không select `period_start`
- ❌ Doanh thu tháng này tính theo `created_at` (sai)
- ❌ Không filter `deleted_at`

### Sau:
- ✅ `getRevenueStats()` select `period_start`
- ✅ Doanh thu tháng này tính theo `period_start` (đúng)
- ✅ Filter `deleted_at` để không đếm bills đã xóa
- ✅ `getRevenueTrend()` cũng filter `deleted_at`

---

## ✅ Files Đã Sửa

1. **`services/dashboardService.js`**
   - ✅ Sửa `getRevenueStats()` - thêm `period_start` vào select
   - ✅ Sửa `getRevenueStats()` - thêm filter `deleted_at`
   - ✅ Sửa `getRevenueTrend()` - thêm filter `deleted_at`

---

**Đã sửa xong! Logic doanh thu bây giờ đúng và chuẩn.**


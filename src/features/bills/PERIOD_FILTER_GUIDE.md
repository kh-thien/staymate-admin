# Hướng dẫn Filter Kỳ hạn (Period Filter)

## 📋 Tổng quan

Filter "Kỳ hạn" cho phép lọc hóa đơn theo khoảng thời gian của kỳ hạn thanh toán (period_start - period_end).

## 🎯 Các loại filter

### 1. **Tất cả kỳ hạn** (all)
- Không áp dụng filter theo ngày
- Hiển thị tất cả hóa đơn

### 2. **Tháng này** (this_month)
- Tự động tính: Ngày 1 đến ngày cuối của tháng hiện tại
- Ví dụ: 01/11/2025 → 30/11/2025

### 3. **Tháng trước** (last_month)
- Tự động tính: Ngày 1 đến ngày cuối của tháng trước
- Ví dụ: 01/10/2025 → 31/10/2025

### 4. **Năm nay** (this_year)
- Tự động tính: 01/01 đến 31/12 của năm hiện tại
- Ví dụ: 01/01/2025 → 31/12/2025

### 5. **Tùy chỉnh** (custom)
- Cho phép nhập khoảng ngày tùy ý
- Hiển thị 2 input: "Từ ngày" và "Đến ngày"

## 🔧 Cách hoạt động

### Frontend (BillFilters.jsx)

```javascript
const getPeriodDates = (periodType) => {
  const now = new Date();
  let periodFrom = "";
  let periodTo = "";

  switch (periodType) {
    case "this_month":
      // Ngày đầu tháng
      periodFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split("T")[0];
      // Ngày cuối tháng
      periodTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split("T")[0];
      break;
    
    case "last_month":
      periodFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString().split("T")[0];
      periodTo = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString().split("T")[0];
      break;
    
    case "this_year":
      periodFrom = new Date(now.getFullYear(), 0, 1)
        .toISOString().split("T")[0];
      periodTo = new Date(now.getFullYear(), 11, 31)
        .toISOString().split("T")[0];
      break;
  }

  return { periodFrom, periodTo };
};
```

### Backend (billService.js)

```javascript
// Filter by period (period_start to period_end)
if (filters.periodFrom) {
  query = query.gte("period_start", filters.periodFrom);
}

if (filters.periodTo) {
  query = query.lte("period_end", filters.periodTo);
}
```

## 📊 Database Schema

```sql
-- Bills table có các trường:
period_start DATE  -- Ngày bắt đầu kỳ hạn
period_end   DATE  -- Ngày kết thúc kỳ hạn
due_date     DATE  -- Ngày đến hạn thanh toán
```

## 💡 Use Cases

### Ví dụ 1: Tìm hóa đơn tháng 10/2025
1. Mở "Bộ lọc nâng cao"
2. Chọn "Loại kỳ hạn" = **Tháng trước** (nếu đang ở tháng 11)
3. Hoặc chọn **Tùy chỉnh** và nhập:
   - Từ ngày: 01/10/2025
   - Đến ngày: 31/10/2025

### Ví dụ 2: Tìm hóa đơn quý 1/2025
1. Chọn "Loại kỳ hạn" = **Tùy chỉnh**
2. Nhập:
   - Từ ngày: 01/01/2025
   - Đến ngày: 31/03/2025

### Ví dụ 3: Tìm hóa đơn năm 2025
1. Chọn "Loại kỳ hạn" = **Năm nay** (nếu đang ở năm 2025)

## 🎨 UI Components

### Basic Filters (Luôn hiển thị)
- Bất động sản
- Trạng thái
- Sắp xếp
- Thứ tự

### Advanced Filters (Mở khi cần)
- **Loại kỳ hạn**: Dropdown chọn preset (Tháng này, Tháng trước, Năm nay, Tùy chỉnh)
- **Từ ngày** & **Đến ngày**: Chỉ hiện khi chọn "Tùy chỉnh"
- **Khoảng thời gian**: Hiển thị readonly khi chọn preset (màu xanh)

## ⚠️ Lưu ý

1. **Không còn filter "Hợp đồng" và "Người thuê"** trong advanced filters
2. Filter kỳ hạn dựa trên `period_start` và `period_end`, KHÔNG phải `due_date`
3. Preset options (Tháng này, Tháng trước, Năm nay) tự động tính toán
4. Custom option cho phép nhập bất kỳ khoảng thời gian nào

## 🔄 Flow hoạt động

```
User chọn "Tháng này"
  ↓
getPeriodDates("this_month") tính toán
  ↓
periodFrom = "2025-11-01"
periodTo = "2025-11-30"
  ↓
handleFilterChange() update state
  ↓
bills.jsx nhận filters.periodFrom & filters.periodTo
  ↓
useBills(filters) gọi billService.getBills()
  ↓
Supabase query:
  .gte("period_start", "2025-11-01")
  .lte("period_end", "2025-11-30")
  ↓
Return bills có kỳ hạn trong tháng 11/2025
```

## 📝 Testing

### Test case 1: Tháng này
- Chọn "Tháng này"
- Verify: Hiển thị bills có period_start >= 01/11/2025 AND period_end <= 30/11/2025

### Test case 2: Custom range
- Chọn "Tùy chỉnh"
- Nhập: 01/09/2025 → 30/09/2025
- Verify: Hiển thị bills có period trong tháng 9/2025

### Test case 3: Clear filters
- Bấm "Xóa bộ lọc"
- Verify: periodType reset về "all", periodFrom/periodTo rỗng

# 🏠 StayMate - Property Management System

<div align="center">

**Choose Language / Chọn Ngôn Ngữ:**

[![English](https://img.shields.io/badge/English-🇬🇧-blue?style=for-the-badge)](#english)
[![Tiếng Việt](https://img.shields.io/badge/Tiếng_Việt-🇻🇳-green?style=for-the-badge)](#tiếng-việt)

</div>

---

<a id="english"></a>
# 🇬🇧 English

## 🏠 StayMate - Property Management System

StayMate is a comprehensive property management system designed to help landlords efficiently manage their daily operations, from room management, contracts, bills, to financial reporting.

## ✨ Key Features

### 📊 Dashboard
- System overview with key statistics
- Revenue charts and trends
- Recent activities with detailed information
- Real-time updates

### 🏢 Property Management
- Manage multiple properties
- Detailed information for each property
- Activity status

### 🚪 Room Management
- Manage rooms by property
- Room status: Occupied, Vacant, Under Maintenance
- Detailed room information (rent, amenities, etc.)

### 👥 Tenant Management
- Manage tenant information
- Contract history
- Contact information

### 📄 Contract Management
- Create and manage rental contracts
- Track contract expiration
- Renewal and termination
- Expiring contract notifications

### 💰 Bill Management
- Auto-generate bills based on contracts
- Payment management
- Debt tracking
- Rent and service bills

### 📈 Reports & Analytics
- **Financial Reports:**
  - Revenue, expenses, profit
  - Monthly/Quarterly/Yearly analysis
  - Trend charts
  - Collection rate
  
- **Occupancy Reports:**
  - Room occupancy rate
  - Occupancy trends over time
  - Room distribution
  
- **Maintenance Reports:**
  - Maintenance costs
  - Maintenance request status
  
- **Contract Reports:**
  - Contract statistics
  - Expiring contracts

### 🔧 Maintenance Management
- Create and track maintenance requests
- Manage maintenance costs
- Status: Pending, In Progress, Completed
- Real-time notifications

### 💳 Payment Management
- Track payments
- Transaction history
- Payment accounts

### 💬 Chat & Support
- Real-time chat with tenants
- File and image uploads
- Message history

### 📱 Utility Meters
- Manage utility meter readings
- Calculate utility bills
- Reading history

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Charts and graphs
- **React Hook Form** - Form management
- **Yup** - Validation
- **Heroicons** - Icons
- **date-fns** - Date utilities

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Realtime subscriptions
  - Row Level Security (RLS)

### Deployment
- **Vercel** - Hosting and deployment
- **Vercel Analytics** - Analytics
- **Vercel Speed Insights** - Performance monitoring

## 📦 Installation

### Requirements
- Node.js >= 18.x
- npm or yarn

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd staymate/web-admin/my-app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` file in root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Run Development Server
```bash
npm run dev
```

Application will run at `http://localhost:5173`

## 🚀 Scripts

```bash
# Development
npm run dev          # Run dev server

# Build
npm run build        # Build for production

# Preview
npm run preview      # Preview production build

# Lint
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── assets/              # Static assets
├── core/                # Core components and utilities
│   ├── components/      # Shared components
│   ├── data/           # Data layer (Supabase, localStorage)
│   ├── models/         # Data models
│   └── network/        # API utilities
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard
│   ├── property/       # Property management
│   ├── rooms/          # Room management
│   ├── tenants/        # Tenant management
│   ├── contracts/      # Contract management
│   ├── bills/          # Bill management
│   ├── payments/       # Payment management
│   ├── maintenance/    # Maintenance management
│   ├── reports/        # Reports & Analytics
│   ├── chat/          # Chat feature
│   └── ...
├── router/             # Routing configuration
└── main.jsx           # Entry point
```

## 🔐 Authentication

The application uses Supabase Authentication with features:
- Email sign up/sign in
- Google OAuth login
- Password reset
- Email verification
- Row Level Security (RLS) for data protection

## 📊 Realtime Features

- Real-time updates for:
  - New bills/payments
  - Maintenance requests
  - Chat messages
  - Recent activities
  - Auto-refresh reports

## 🎨 UI/UX

- Responsive design (Mobile, Tablet, Desktop)
- Dark mode support (if available)
- Loading states and skeleton screens
- Error boundaries
- Toast notifications
- Accessible components

## 📈 Performance

- Code splitting and lazy loading
- Component memoization
- Optimized database queries
- Realtime subscriptions with debouncing
- Image optimization

## 🧪 Testing

```bash
# Run tests (if available)
npm test
```

## 📝 Documentation

- [Database Report](./DATABASE_REPORT.md) - Database structure details
- [Reports Analysis](./src/features/reports/COMPREHENSIVE_ANALYSIS.md) - Reports feature analysis
- [Dashboard Analysis](./src/features/dashboard/PHAN_TICH_DASHBOARD.md) - Dashboard analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Private project - All rights reserved

## 👥 Team

StayMate Development Team

## 📞 Support

If you have issues or questions, please create an issue in the repository.

---

<a id="tiếng-việt"></a>
# 🇻🇳 Tiếng Việt

## 🏠 StayMate - Hệ Thống Quản Lý Nhà Trọ

StayMate là một hệ thống quản lý nhà trọ toàn diện, giúp chủ nhà trọ quản lý hiệu quả các hoạt động hàng ngày từ quản lý phòng, hợp đồng, hóa đơn, đến báo cáo tài chính.

## ✨ Tính Năng Chính

### 📊 Dashboard
- Tổng quan hệ thống với các thống kê quan trọng
- Biểu đồ doanh thu và xu hướng
- Hoạt động gần đây với thông tin chi tiết
- Cập nhật realtime

### 🏢 Quản Lý Bất Động Sản
- Quản lý nhiều bất động sản
- Thông tin chi tiết từng bất động sản
- Trạng thái hoạt động

### 🚪 Quản Lý Phòng
- Quản lý phòng theo từng bất động sản
- Trạng thái phòng: Đã thuê, Trống, Đang bảo trì
- Thông tin chi tiết phòng (giá thuê, tiện ích, v.v.)

### 👥 Quản Lý Người Thuê
- Quản lý thông tin người thuê
- Lịch sử hợp đồng
- Thông tin liên hệ

### 📄 Quản Lý Hợp Đồng
- Tạo và quản lý hợp đồng thuê
- Theo dõi thời hạn hợp đồng
- Gia hạn và chấm dứt hợp đồng
- Thông báo hợp đồng sắp hết hạn

### 💰 Quản Lý Hóa Đơn
- Tạo hóa đơn tự động theo hợp đồng
- Quản lý thanh toán
- Theo dõi công nợ
- Hóa đơn tiền thuê và dịch vụ

### 📈 Báo Cáo & Phân Tích
- **Báo cáo tài chính:**
  - Doanh thu, chi phí, lợi nhuận
  - Phân tích theo tháng/quý/năm
  - Biểu đồ xu hướng
  - Tỷ lệ thu tiền
  
- **Báo cáo lấp đầy:**
  - Tỷ lệ lấp đầy phòng
  - Xu hướng lấp đầy theo thời gian
  - Phân bổ phòng
  
- **Báo cáo bảo trì:**
  - Chi phí bảo trì
  - Trạng thái yêu cầu bảo trì
  
- **Báo cáo hợp đồng:**
  - Thống kê hợp đồng
  - Hợp đồng sắp hết hạn

### 🔧 Quản Lý Bảo Trì
- Tạo và theo dõi yêu cầu bảo trì
- Quản lý chi phí bảo trì
- Trạng thái: Pending, In Progress, Completed
- Thông báo realtime

### 💳 Quản Lý Thanh Toán
- Theo dõi thanh toán
- Lịch sử giao dịch
- Tài khoản thanh toán

### 💬 Chat & Hỗ Trợ
- Chat realtime với người thuê
- Upload file và hình ảnh
- Lịch sử tin nhắn

### 📱 Đồng Hồ Điện Nước
- Quản lý chỉ số đồng hồ
- Tính toán tiền điện nước
- Lịch sử chỉ số

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool và dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Biểu đồ và charts
- **React Hook Form** - Form management
- **Yup** - Validation
- **Heroicons** - Icons
- **date-fns** - Date utilities

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Realtime subscriptions
  - Row Level Security (RLS)

### Deployment
- **Vercel** - Hosting và deployment
- **Vercel Analytics** - Analytics
- **Vercel Speed Insights** - Performance monitoring

## 📦 Cài Đặt

### Yêu Cầu
- Node.js >= 18.x
- npm hoặc yarn

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd staymate/web-admin/my-app
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình Environment Variables
Tạo file `.env` trong thư mục root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Bước 4: Chạy Development Server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 🚀 Scripts

```bash
# Development
npm run dev          # Chạy dev server

# Build
npm run build        # Build cho production

# Preview
npm run preview      # Preview build production

# Lint
npm run lint         # Chạy ESLint
```

## 📁 Cấu Trúc Dự Án

```
src/
├── assets/              # Static assets
├── core/                # Core components và utilities
│   ├── components/      # Shared components
│   ├── data/           # Data layer (Supabase, localStorage)
│   ├── models/         # Data models
│   └── network/        # API utilities
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard
│   ├── property/       # Property management
│   ├── rooms/          # Room management
│   ├── tenants/        # Tenant management
│   ├── contracts/      # Contract management
│   ├── bills/          # Bill management
│   ├── payments/       # Payment management
│   ├── maintenance/    # Maintenance management
│   ├── reports/        # Reports & Analytics
│   ├── chat/          # Chat feature
│   └── ...
├── router/             # Routing configuration
└── main.jsx           # Entry point
```

## 🔐 Authentication

Ứng dụng sử dụng Supabase Authentication với các tính năng:
- Đăng ký/Đăng nhập email
- Đăng nhập Google OAuth
- Quên mật khẩu
- Xác thực email
- Row Level Security (RLS) cho data protection

## 📊 Realtime Features

- Cập nhật realtime cho:
  - Hóa đơn mới/thanh toán
  - Yêu cầu bảo trì
  - Chat messages
  - Hoạt động gần đây
  - Báo cáo tự động refresh

## 🎨 UI/UX

- Responsive design (Mobile, Tablet, Desktop)
- Dark mode support (nếu có)
- Loading states và skeleton screens
- Error boundaries
- Toast notifications
- Accessible components

## 📈 Performance

- Code splitting và lazy loading
- Memoization cho components
- Optimized database queries
- Realtime subscriptions với debouncing
- Image optimization

## 🧪 Testing

```bash
# Chạy tests (nếu có)
npm test
```

## 📝 Documentation

- [Database Report](./DATABASE_REPORT.md) - Chi tiết về database structure
- [Reports Analysis](./src/features/reports/COMPREHENSIVE_ANALYSIS.md) - Phân tích tính năng báo cáo
- [Dashboard Analysis](./src/features/dashboard/PHAN_TICH_DASHBOARD.md) - Phân tích dashboard

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Private project - All rights reserved

## 👥 Team

StayMate Development Team

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.

---

<div align="center">

**Made with ❤️ by StayMate Team**

[⬆ Back to Top / Về Đầu Trang](#-staymate---property-management-system)

</div>

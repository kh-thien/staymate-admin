# 📧 Cấu Hình Email Service - Tenant Invitation

## ✅ Đã Cập Nhật

Code đã được cập nhật để sử dụng **StayMate Server** thay vì localhost.

## 🔧 Cấu Hình

### Environment Variable

Thêm vào **Vercel Environment Variables**:

```
VITE_STAYMATE_SERVER=https://staymateserver.vercel.app/
```

**Lưu ý**: 
- Có thể có hoặc không có trailing slash (`/`)
- Code sẽ tự động xử lý

### Local Development

Tạo file `.env.local`:

```env
VITE_STAYMATE_SERVER=https://staymateserver.vercel.app/
```

## 📡 API Endpoint

Code sẽ gọi endpoint:

```
POST https://staymateserver.vercel.app/api/send-invitation-email
```

### Request Body

```json
{
  "tenantName": "Tên người thuê",
  "email": "tenant@example.com",
  "invitationUrl": "https://staymatehome.me/invite/accept?token=xxx",
  "expiresAt": "2024-01-15T10:00:00.000Z"
}
```

### Expected Response

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

## 🔄 Flow Hoạt Động

```
1. User click "Gửi lời mời"
   ↓
2. Code tạo invitation token
   ↓
3. Code gọi StayMate Server API
   POST https://staymateserver.vercel.app/api/send-invitation-email
   ↓
4. Server gửi email đến tenant.email
   ↓
5. Hiển thị thông báo thành công
```

## 📧 Email Được Gửi Đến

**Email được gửi đến**: `tenant.email` - Email của người thuê nhà trong database

## 🛠️ Server Requirements

StayMate Server cần implement endpoint:

### Endpoint: `/api/send-invitation-email`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```typescript
{
  tenantName: string;
  email: string;
  invitationUrl: string;
  expiresAt: string; // ISO 8601 format
}
```

**Response**:
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

## 🧪 Test

### Test trên Local

1. Thêm vào `.env.local`:
   ```env
   VITE_STAYMATE_SERVER=https://staymateserver.vercel.app/
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Test gửi invitation:
   - Vào trang quản lý người thuê
   - Click "Gửi lời mời"
   - Check browser console để xem request

### Test trên Production

1. Thêm environment variable trên Vercel:
   - Vào Vercel Dashboard
   - Project Settings → Environment Variables
   - Add: `VITE_STAYMATE_SERVER` = `https://staymateserver.vercel.app/`

2. Redeploy (hoặc đợi auto-deploy)

3. Test gửi invitation

## 🐛 Troubleshooting

### Vấn đề 1: "Server URL chưa được cấu hình"
**Nguyên nhân**: `VITE_STAYMATE_SERVER` chưa được set

**Giải pháp**:
- Thêm vào Vercel Environment Variables
- Hoặc thêm vào `.env.local` cho local dev

### Vấn đề 2: CORS Error
**Nguyên nhân**: Server chưa cho phép CORS từ domain của bạn

**Giải pháp**: 
- Cấu hình CORS trên StayMate Server
- Cho phép origin: `https://staymatehome.me`

### Vấn đề 3: 404 Not Found
**Nguyên nhân**: Endpoint không tồn tại trên server

**Giải pháp**:
- Kiểm tra endpoint: `/api/send-invitation-email`
- Đảm bảo server đã implement endpoint này

### Vấn đề 4: 500 Internal Server Error
**Nguyên nhân**: Server có lỗi khi xử lý request

**Giải pháp**:
- Check server logs
- Kiểm tra email service (Resend, SendGrid, etc.) đã được cấu hình chưa

## 📝 Code Changes

### File: `src/features/tenants/services/tenantInvitationService.js`

**Thay đổi**:
- ✅ Sử dụng `VITE_STAYMATE_SERVER` thay vì hardcoded localhost
- ✅ Tự động xử lý trailing slash
- ✅ Better error handling
- ✅ Logging chi tiết hơn

## ✅ Checklist

- [ ] Đã thêm `VITE_STAYMATE_SERVER` vào Vercel Environment Variables
- [ ] Đã thêm `VITE_STAYMATE_SERVER` vào `.env.local` (cho local dev)
- [ ] StayMate Server đã implement endpoint `/api/send-invitation-email`
- [ ] Server đã cấu hình email service (Resend, SendGrid, etc.)
- [ ] CORS đã được cấu hình trên server
- [ ] Đã test gửi invitation trên local
- [ ] Đã test gửi invitation trên production

---

**Sau khi cấu hình xong, email sẽ được gửi thực tế đến tenant.email!** 📧✅


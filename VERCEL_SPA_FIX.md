# 🔧 Fix 404 Error trên Vercel - SPA Routing

## 🐛 Vấn Đề

Khi truy cập trực tiếp URL như `https://www.staymatehome.me/signin` trên Vercel, gặp lỗi:
- **404 NOT_FOUND**
- Code: `NOT_FOUND`
- ID: `sin1::phwxv-1762917172833-7885555d7296`

Nhưng khi vào `/` và click vào signin thì hoạt động bình thường.

## 🔍 Nguyên Nhân

Đây là vấn đề phổ biến với **Single Page Application (SPA)** trên Vercel:

1. **Client-side routing**: React Router xử lý routing ở phía client
2. **Server-side routing**: Khi truy cập trực tiếp `/signin`, server tìm file `signin.html` hoặc `signin/index.html`
3. **Không tìm thấy**: Server không tìm thấy file → Trả về 404

### Flow khi click link (hoạt động):
```
User click link → Browser navigate → React Router handle → ✅ Hoạt động
```

### Flow khi truy cập trực tiếp URL (lỗi):
```
User type URL → Server tìm file → Không tìm thấy → ❌ 404 Error
```

## ✅ Giải Pháp

Tạo file `vercel.json` để cấu hình Vercel **rewrite** tất cả requests về `index.html`, để React Router có thể xử lý.

### File: `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Giải Thích

1. **`rewrites`**: 
   - `"source": "/(.*)"` - Match tất cả paths
   - `"destination": "/index.html"` - Rewrite về `index.html`
   - Kết quả: Tất cả requests đều serve `index.html`, React Router sẽ xử lý routing

2. **`headers`**:
   - Cache static assets (JS, CSS) trong 1 năm
   - Tăng performance

## 🔄 Flow Sau Khi Fix

### Truy cập trực tiếp URL:
```
User type: https://staymatehome.me/signin
  ↓
Vercel server: Rewrite về /index.html
  ↓
Browser load: index.html + React app
  ↓
React Router: Detect path = /signin
  ↓
Render: SignIn component
  ↓
✅ Hoạt động!
```

## 📋 Checklist

- [x] Tạo file `vercel.json` trong root directory
- [ ] Commit và push lên GitHub
- [ ] Vercel tự động deploy
- [ ] Test truy cập trực tiếp `/signin`
- [ ] Test truy cập trực tiếp các routes khác (`/home`, `/signup`, etc.)

## 🧪 Test Cases

### Test 1: Truy cập trực tiếp `/signin`
```
https://staymatehome.me/signin
```
- ✅ Không còn 404
- ✅ SignIn page hiển thị đúng

### Test 2: Truy cập trực tiếp `/home`
```
https://staymatehome.me/home
```
- ✅ Nếu chưa login → Redirect về `/signin`
- ✅ Nếu đã login → Dashboard hiển thị

### Test 3: Truy cập trực tiếp các routes khác
```
https://staymatehome.me/signup
https://staymatehome.me/forgot
https://staymatehome.me/tenants
```
- ✅ Tất cả routes hoạt động

## 🚀 Deploy

Sau khi tạo file `vercel.json`:

```bash
git add vercel.json
git commit -m "fix: add vercel.json for SPA routing"
git push origin main
```

Vercel sẽ tự động:
1. Detect file `vercel.json`
2. Apply cấu hình
3. Redeploy
4. Routes sẽ hoạt động đúng

## 📝 Lưu Ý

1. **File location**: `vercel.json` phải ở **root directory** của project
2. **Format**: Phải là valid JSON
3. **Deploy**: Vercel tự động detect và apply cấu hình
4. **Cache**: Có thể cần clear cache hoặc hard refresh sau khi deploy

## 🔍 Troubleshooting

### Vấn đề 1: Vẫn 404 sau khi deploy
**Giải pháp**:
- Kiểm tra file `vercel.json` có ở root không
- Kiểm tra JSON syntax có đúng không
- Đợi vài phút để Vercel apply cấu hình
- Clear browser cache và thử lại

### Vấn đề 2: Static assets không load
**Giải pháp**:
- Kiểm tra build output có `dist/assets/` không
- Kiểm tra `vite.config.js` có đúng không

### Vấn đề 3: Routes vẫn không hoạt động
**Giải pháp**:
- Kiểm tra React Router config
- Kiểm tra browser console có lỗi không
- Kiểm tra Vercel deployment logs

## 📚 Tài Liệu Tham Khảo

- [Vercel Rewrites](https://vercel.com/docs/configuration/routes/rewrites)
- [Vercel Headers](https://vercel.com/docs/configuration/routes/headers)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)

---

**Sau khi deploy, tất cả routes sẽ hoạt động khi truy cập trực tiếp URL!** ✅


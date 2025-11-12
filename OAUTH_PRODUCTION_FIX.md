# 🔧 Fix OAuth và Logout trên Production

## 🐛 Vấn Đề

### 1. OAuth Redirect trên Production
- Đăng nhập Google thành công nhưng redirect về `/` thay vì `/home`
- Local hoạt động tốt, production không đúng

### 2. Logout Redirect
- Sau khi logout vẫn ở `/home` thay vì redirect về `/`
- Có lỗi 403 Forbidden khi logout

## ✅ Giải Pháp Đã Áp Dụng

### 1. Fix OAuth Redirect Logic

**Vấn đề**: Code chỉ redirect nếu path là `/signin`, nhưng OAuth callback về `/`

**Fix**: Thêm logic redirect từ `/` về `/home` sau khi login

```javascript
// Trước: Chỉ redirect từ /signin
if (path === "/signin") {
  navigate("/home", { replace: true });
}

// Sau: Redirect từ cả /signin và / (OAuth callback)
if (path === "/signin" || path === "/") {
  navigate("/home", { replace: true });
}
```

### 2. Fix Logout Redirect

**Vấn đề**: Sau logout không redirect về trang chủ

**Fix**: Thêm `navigate("/")` sau khi logout

```javascript
const logout = async () => {
  // ... logout logic
  setUser(null);
  setJustLoggedIn(false);
  navigate("/", { replace: true }); // ✅ Redirect về trang chủ
  return { success: true };
}
```

### 3. Logout 403 Error

**Đã fix trong commit trước**: Fallback strategy từ global → local → force clear storage

## 🔧 Cấu Hình Cần Kiểm Tra

### 1. Supabase Dashboard - Redirect URLs

**Vào**: [Supabase Dashboard](https://app.supabase.com) → Your Project → **Authentication** → **URL Configuration**

**Thêm vào Redirect URLs**:
```
https://staymatehome.me/**
https://staymatehome.me/home
http://localhost:5173/**
http://localhost:5173/home
```

**Site URL** (nếu cần):
```
https://staymatehome.me
```

### 2. Google Cloud Console - Authorized Redirect URIs

**Vào**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID

**Authorized redirect URIs** phải có:
```
https://detjjoponbvlgzeglkty.supabase.co/auth/v1/callback
```

**Lưu ý**: 
- ✅ Đây là Supabase callback URL (đúng rồi)
- ✅ Google sẽ redirect về Supabase, Supabase sẽ redirect về app
- ❌ Không cần thêm `https://staymatehome.me` vào đây

### 3. Code - OAuth Redirect URL

**File**: `src/features/auth/services/authServices.jsx`

```javascript
signInWithProvider: async (provider) => {
  const redirectUrl = window.location.origin + "/home";
  // redirectUrl sẽ tự động là:
  // - Local: http://localhost:5173/home
  // - Production: https://staymatehome.me/home
}
```

**✅ Code đã đúng** - Tự động detect origin

## 📋 Checklist Cấu Hình

### Supabase Dashboard
- [ ] **Redirect URLs** có `https://staymatehome.me/**`
- [ ] **Redirect URLs** có `https://staymatehome.me/home`
- [ ] **Redirect URLs** có `http://localhost:5173/**` (cho dev)
- [ ] **Site URL** là `https://staymatehome.me` (optional)

### Google Cloud Console
- [ ] **Authorized redirect URIs** có `https://detjjoponbvlgzeglkty.supabase.co/auth/v1/callback`
- [ ] OAuth consent screen đã được cấu hình
- [ ] Client ID và Client Secret đã được thêm vào Supabase

### Supabase - Provider Settings
- [ ] Google provider đã được enable
- [ ] Client ID và Client Secret đã được thêm
- [ ] Redirect URL trong Supabase match với Google Console

## 🔄 Flow OAuth Sau Khi Fix

### Local (localhost:5173)
```
1. User click "Sign in with Google"
2. Redirect đến Google
3. User đăng nhập Google
4. Google redirect về: https://detjjoponbvlgzeglkty.supabase.co/auth/v1/callback
5. Supabase xử lý và redirect về: http://localhost:5173/home
6. App detect path = "/home" → User đã login → Hiển thị dashboard
```

### Production (staymatehome.me)
```
1. User click "Sign in with Google"
2. Redirect đến Google
3. User đăng nhập Google
4. Google redirect về: https://detjjoponbvlgzeglkty.supabase.co/auth/v1/callback
5. Supabase xử lý và redirect về: https://staymatehome.me/home
   ⚠️ Nếu Supabase Redirect URLs chưa có production URL → redirect về Site URL (/)
6. App detect:
   - Nếu path = "/" → Auto redirect về /home (✅ Đã fix)
   - Nếu path = "/home" → Hiển thị dashboard
```

## 🔄 Flow Logout Sau Khi Fix

```
1. User click "Logout"
2. Call signOut API (có fallback nếu fail)
3. Clear local storage
4. Clear user state
5. Redirect về "/" (✅ Đã fix)
6. ProtectedLayout detect không có user → Redirect về /signin
```

## 🧪 Test Cases

### Test 1: OAuth Login trên Production
- [ ] Click "Sign in with Google"
- [ ] Đăng nhập Google thành công
- [ ] Redirect về `/home` (không phải `/`)
- [ ] Dashboard hiển thị đúng

### Test 2: Logout trên Production
- [ ] Click "Logout"
- [ ] Redirect về `/` hoặc `/signin`
- [ ] Không còn lỗi 403
- [ ] User state đã được clear

### Test 3: OAuth Login trên Local
- [ ] Click "Sign in with Google"
- [ ] Đăng nhập Google thành công
- [ ] Redirect về `/home`
- [ ] Dashboard hiển thị đúng

## 🐛 Troubleshooting

### Vấn đề 1: OAuth vẫn redirect về `/` trên production
**Nguyên nhân**: Supabase Redirect URLs chưa có production URL

**Giải pháp**:
1. Vào Supabase Dashboard
2. Authentication → URL Configuration
3. Thêm `https://staymatehome.me/**` và `https://staymatehome.me/home`
4. Save và đợi vài giây
5. Test lại

### Vấn đề 2: Logout vẫn có lỗi 403
**Nguyên nhân**: Session đã expire hoặc invalid

**Giải pháp**: 
- Code đã có fallback, sẽ clear local storage ngay cả khi API fail
- User vẫn logout được, chỉ có warning trong console

### Vấn đề 3: Redirect về `/` nhưng không auto redirect về `/home`
**Nguyên nhân**: `justLoggedIn` flag không được set

**Giải pháp**:
- Check console logs xem `justLoggedIn` có được set không
- Check xem có phải OAuth login không (có `access_token` trong URL hash)

## 📝 Files Đã Thay Đổi

1. **`src/features/auth/context/auth/authProvider.jsx`**:
   - Fix OAuth redirect: Thêm logic redirect từ `/` về `/home`
   - Fix logout redirect: Thêm `navigate("/")` sau logout

2. **`src/features/auth/services/authServices.jsx`** (từ commit trước):
   - Fix logout với fallback strategy

## 🚀 Deploy

Sau khi fix, deploy lên production:

```bash
git add .
git commit -m "fix: improve OAuth redirect and logout redirect on production"
git push origin main
```

Vercel sẽ tự động deploy.

---

## ✅ Kết Quả Mong Đợi

Sau khi fix và cấu hình đúng:

1. ✅ OAuth login trên production → Redirect về `/home`
2. ✅ Logout trên production → Redirect về `/`
3. ✅ Không còn lỗi 403 (hoặc có nhưng không ảnh hưởng UX)
4. ✅ Local vẫn hoạt động bình thường

---

**Lưu ý quan trọng**: Đảm bảo đã thêm production URL vào Supabase Redirect URLs, nếu không OAuth sẽ không hoạt động đúng!


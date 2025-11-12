# 🔧 Fix Lỗi Logout Trên Production

## 🐛 Vấn Đề

Trên production, khi đăng xuất gặp lỗi:
- `403 Forbidden` khi gọi `/auth/v1/logout?scope=global`
- `Auth session missing!` - Session đã mất hoặc không hợp lệ
- User không thể đăng xuất được

## 🔍 Nguyên Nhân

1. **Session đã expire**: Session có thể đã hết hạn nhưng vẫn còn trong local storage
2. **Cookie domain mismatch**: Cookies có thể không match giữa domain và Supabase
3. **CORS issues**: Có thể có vấn đề với CORS khi gọi logout API
4. **Network issues**: Request có thể bị block hoặc timeout

## ✅ Giải Pháp Đã Áp Dụng

### 1. Cải Thiện `signOut` Function

**Trước đây**:
```javascript
signOut: async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}
```

**Sau khi fix**:
- ✅ Kiểm tra session trước khi logout
- ✅ Fallback từ `global` → `local` logout nếu global fail
- ✅ Force clear local storage nếu cả 2 đều fail
- ✅ Luôn return success sau khi clear local storage

### 2. Cải Thiện `logout` Function trong AuthProvider

**Trước đây**:
```javascript
const logout = async () => {
  const result = await AuthService.signOut();
  if (result.success) {
    return { success: true };
  } else {
    throw result.error; // ❌ Throw error → UI stuck
  }
}
```

**Sau khi fix**:
- ✅ Không throw error ngay cả khi API fail
- ✅ Force clear user state
- ✅ Luôn return success để UI không bị stuck

## 🔄 Flow Logout Mới

```
1. Kiểm tra session có tồn tại không?
   ├─ Không → Clear local storage → Success
   └─ Có → Bước 2

2. Thử logout với scope='global'
   ├─ Success → Done
   └─ Fail → Bước 3

3. Thử logout với scope='local'
   ├─ Success → Done
   └─ Fail → Bước 4

4. Force clear localStorage và sessionStorage
   └─ Success (luôn clear được)
```

## 📝 Các Thay Đổi

### File: `src/features/auth/services/authServices.jsx`

1. **Kiểm tra session trước**:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     // Clear local storage ngay
     await supabase.auth.signOut({ scope: 'local' });
     return { success: true };
   }
   ```

2. **Fallback strategy**:
   ```javascript
   // Thử global logout
   const { error } = await supabase.auth.signOut({ scope: 'global' });
   
   if (error) {
     // Fallback: local logout
     await supabase.auth.signOut({ scope: 'local' });
   }
   ```

3. **Force clear storage**:
   ```javascript
   // Nếu cả 2 đều fail, force clear
   Object.keys(localStorage).forEach(key => {
     if (key.includes('supabase')) {
       localStorage.removeItem(key);
     }
   });
   sessionStorage.clear();
   ```

### File: `src/features/auth/context/auth/authProvider.jsx`

1. **Không throw error**:
   ```javascript
   // Luôn return success, không throw
   return { success: true };
   ```

2. **Force clear state**:
   ```javascript
   setUser(null);
   setJustLoggedIn(false);
   ```

## 🎯 Kết Quả

- ✅ User luôn có thể đăng xuất được, kể cả khi API fail
- ✅ Local storage luôn được clear
- ✅ UI không bị stuck khi logout
- ✅ Không còn uncaught exceptions

## 🧪 Test Cases

### Test 1: Normal Logout
- ✅ User có session hợp lệ → Logout thành công

### Test 2: Expired Session
- ✅ Session đã expire → Vẫn logout được (clear local)

### Test 3: Network Error
- ✅ Network fail → Vẫn logout được (clear local)

### Test 4: API Error
- ✅ API return 403 → Vẫn logout được (fallback to local)

## 🔍 Debug

Nếu vẫn gặp vấn đề, check console logs:

```
⚠️ No active session found, clearing local storage
⚠️ Global logout failed, trying local logout: [error message]
⚠️ Local logout also failed: [error message]
```

Các logs này cho biết:
- Session có tồn tại không
- Global logout có fail không
- Local logout có fail không

## 📊 Monitoring

Để monitor logout issues trên production:

1. **Check error logs** trong browser console
2. **Check Supabase logs** trong Dashboard
3. **Check network requests** trong DevTools

## 🚀 Deploy

Sau khi fix, deploy lên production:

```bash
git add .
git commit -m "fix: improve logout handling with fallback strategy"
git push origin main
```

Vercel sẽ tự động deploy.

---

**Lưu ý**: Fix này đảm bảo user luôn có thể logout được, ngay cả khi có lỗi từ API. Đây là "graceful degradation" - ưu tiên UX hơn là strict error handling.


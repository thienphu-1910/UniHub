# Đặc tả: Xác thực (Authentication & Authorization)

## Mô tả

Tính năng quản lý danh tính người dùng trong hệ thống. Bao gồm: đăng nhập bằng email/password, cấp phát JWT (access token + refresh token), tự động làm mới access token khi hết hạn, đăng xuất, và kiểm soát quyền truy cập theo role. Token được lưu trong **HttpOnly cookie** (không accessible từ JavaScript) để giảm rủi ro XSS. Phía client dùng **Zustand** để lưu thông tin user vào `localStorage` cho mục đích hiển thị UI.

---

## Luồng chính

### 1. Đăng nhập (Sign In)

```
Client → POST /api/signin { email, password }
       → authController.authenticateUser
           → userService.getUserViaEmail(email)
               → userRepository.getUserViaEmail(email) → SELECT từ DB
           → Kiểm tra user tồn tại
           → Kiểm tra user.isActive === true
           → authService.authenticateUser(password, user)
               → bcrypt.compareSync(password, user.passwordHash)
               → Tạo accessToken (JWT, payload đầy đủ, TTL = ACCESS_EXP)
               → Tạo refreshToken (JWT, chỉ chứa userId, TTL = REFRESH_EXP)
           → Set cookie "accessToken" (HttpOnly, Secure, SameSite=Strict)
           → Set cookie "refreshToken" (HttpOnly, Secure, SameSite=Strict)
           → Trả về { user: { fullName, role, studentId, email, userId } }
```

```
Client (frontend) nhận response:
    → authenticationService.signIn()
        → userStore.setUser(response.data.data.user)
            → Zustand persist → lưu vào localStorage "user-storage"
```

**Payload access token:** `userId`, `email`, `fullName`, `role`, `studentId`  
**Payload refresh token:** chỉ `userId`

---

### 2. Bảo vệ route (Auth Middleware)

```
Request đến protected route
    → auth middleware
        → Đọc req.cookies.accessToken
        → jwt.verify(token, ACCESS_SECRET)
        → req.user = decoded payload
        → next()

    → checkRole([...allowedRoles]) middleware (nếu có)
        → Kiểm tra req.user.role thuộc allowedRoles
        → next() nếu hợp lệ
```

---

### 3. Làm mới access token (Refresh Token)

```
Client → POST /api/refresh-token (cookie refreshToken tự động đính kèm)
       → authController.createToken
           → jwt.verify(refreshToken, REFRESH_SECRET)
           → userService.getUserViaId(decoded.userId) → SELECT từ DB
           → Tạo accessToken mới (ký lại với toàn bộ user object từ DB)
           → Set cookie "accessToken" mới
           → Trả về { success: true }
```

Client (`authenticationService.createToken`) gọi endpoint này khi nhận được lỗi `TOKEN_EXPIRED` từ API.

---

### 4. Đăng xuất (Logout)

```
Client → POST /api/logout
       → authController.logout
           → res.clearCookie("accessToken")
           → res.clearCookie("refreshToken")
           → Trả về { success: true }

Client (frontend):
    → authenticationService.logout() (fire-and-forget, không await)
    → userStore.clearUser() → xóa khỏi localStorage
```

---

## Kịch bản lỗi

| Tình huống | Hành vi |
|---|---|
| Email không tồn tại trong DB | Controller trả về `401` với `"Can not authenticate!"` (không tiết lộ lý do cụ thể) |
| Sai password | `authService` trả về `isAuthenticated: false` → `401 "Can not authenticate!"` |
| Tài khoản bị vô hiệu hóa (`isActive = false`) | Controller trả về `403 "This account is inactive!"` trước khi check password |
| Access token bị thiếu | `auth` middleware trả về `401 TOKEN_MISSING` |
| Access token hết hạn | `auth` middleware trả về `401 TOKEN_EXPIRED` |
| Access token không hợp lệ / bị giả mạo | `auth` middleware trả về `401 INVALID_TOKEN` |
| Role không đủ quyền | `checkRole` middleware trả về `403 FORBIDDEN` |
| `checkRole` được gọi mà không có `auth` trước | Trả về `500 SERVER_ERROR "Auth middleware must be called before checkRole"` |
| Refresh token bị thiếu | `createToken` trả về `401 TOKEN_MISSING` |
| Refresh token hết hạn | `createToken` trả về `401 TOKEN_EXPIRED` |
| Refresh token không hợp lệ | `createToken` trả về `401 INVALID_TOKEN` |
| Lỗi DB (`getUserViaEmail`, `getUserViaId`) | Repository catch lỗi, trả về `null` → controller xử lý như user không tồn tại |
| `userStore` mất sync với cookie (ví dụ: xóa cookie thủ công) | API trả về `TOKEN_MISSING`; client cần xử lý redirect về trang login |

---

## Ràng buộc

### Bảo mật
- Token lưu trong **HttpOnly cookie** — không thể đọc bằng `document.cookie` từ JavaScript, giảm attack surface XSS.
- Cookie dùng `Secure: true` (chỉ gửi qua HTTPS) và `SameSite: Strict` (chống CSRF).
- Password được hash bằng **bcrypt** — không lưu plaintext.
- Refresh token chỉ chứa `userId` — giảm thiểu thông tin nhạy cảm nếu bị decode.
- Thông báo lỗi đăng nhập **không phân biệt** "email không tồn tại" vs "sai password" — tránh user enumeration.

### Token
- Access token có TTL ngắn (định nghĩa qua `ACCESS_EXP` env).
- Refresh token có TTL dài hơn (định nghĩa qua `REFRESH_EXP` env).
- **Không có token blacklist / revocation** — logout chỉ xóa cookie phía client; token vẫn hợp lệ cho đến khi hết hạn nếu bị lấy trộm.
- Khi refresh: access token mới được ký với **dữ liệu đọc lại từ DB** — phản ánh đúng trạng thái hiện tại của user (thay đổi role, v.v.).

### Phía client
- Thông tin user (không nhạy cảm) được persist vào `localStorage` qua Zustand — mục đích duy nhất là hiển thị UI, không dùng để xác thực.
- `authenticationService.logout()` là **fire-and-forget** — không await, không xử lý lỗi.

### Authorization
- `checkRole` phải luôn được đặt **sau** `auth` middleware trong chuỗi middleware.
- Role được lấy từ access token (không query DB lại) — nếu role thay đổi, cần đợi đến khi token hết hạn và refresh.

---

## Tiêu chí chấp nhận

### Đăng nhập
- [ ] Đăng nhập đúng email/password → nhận `200`, cookie `accessToken` và `refreshToken` được set, body chứa thông tin user
- [ ] Đăng nhập sai password → `401`, không set cookie
- [ ] Email không tồn tại → `401`, message không tiết lộ sự tồn tại của tài khoản
- [ ] Tài khoản `isActive = false` → `403 "This account is inactive!"`
- [ ] Zustand store chứa đúng `{ fullName, role, studentId, email, userId }` sau khi đăng nhập thành công

### Middleware
- [ ] Request đến protected route không có cookie → `401 TOKEN_MISSING`
- [ ] Access token hết hạn → `401 TOKEN_EXPIRED`
- [ ] Access token bị sửa → `401 INVALID_TOKEN`
- [ ] Role đúng → request được xử lý tiếp
- [ ] Role sai → `403 FORBIDDEN`

### Refresh Token
- [ ] Refresh token còn hạn → access token mới được set vào cookie, `200`
- [ ] Refresh token hết hạn → `401 TOKEN_EXPIRED`, client phải login lại
- [ ] Access token mới phản ánh dữ liệu user hiện tại trong DB

### Đăng xuất
- [ ] Gọi logout → cookie `accessToken` và `refreshToken` bị xóa
- [ ] Zustand store bị clear, `localStorage` không còn dữ liệu user
- [ ] Sau logout, gọi protected route → `401 TOKEN_MISSING`

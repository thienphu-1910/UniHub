# 📦 Hướng Dẫn Cài Đặt & Chạy Dự Án

## 🗂️ Cấu Trúc Dự Án

```
project/
|── src
|   ├── frontend/       # Giao diện người dùng
|   └── backend/        # Server & API
└── data/
    ├── schema.sql  # Tạo cấu trúc bảng
    ├── index.sql   # Tạo chỉ mục (index)
    └── seed.sql    # Dữ liệu mẫu
```

---

## ⚙️ Yêu Cầu Hệ Thống

- [Node.js](https://nodejs.org/) (>= 18.x)
- [npm](https://www.npmjs.com/) (>= 9.x)
- Tài khoản [Supabase](https://supabase.com/)

---

## 🗄️ Thiết Lập Cơ Sở Dữ Liệu (Supabase)

> Bỏ qua bước này nếu bạn đã có project Supabase sẵn với dữ liệu đầy đủ.

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập.
2. Tạo một **Project mới**.
3. Vào mục **SQL Editor** trên thanh điều hướng bên trái.
4. Lần lượt chạy các file SQL theo thứ tự sau:

   **Bước 1 — Tạo cấu trúc bảng:**
   ```sql
   -- Dán nội dung file data/schema.sql vào đây và chạy
   ```

   **Bước 2 — Tạo chỉ mục:**
   ```sql
   -- Dán nội dung file data/index.sql vào đây và chạy
   ```

   **Bước 3 — Nhập dữ liệu mẫu:**
   ```sql
   -- Dán nội dung file data/seed.sql vào đây và chạy
   ```

5. Sau khi chạy xong, vào **Project Settings → API** để lấy:
   - `Project URL`
   - `anon public key`

---

## 🖥️ Cài Đặt & Chạy Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các dependencies
npm install
```

Tạo file `.env` trong thư mục `backend/` và điền thông tin Supabase:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key
PORT=5000
```

Khởi động server:

```bash
npm start
```

> Server sẽ chạy tại `http://localhost:5000`

---

## 🌐 Cài Đặt & Chạy Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các dependencies
npm install
````

Khởi động ứng dụng ở chế độ phát triển:

```bash
npm run dev
```

> Ứng dụng sẽ chạy tại `http://localhost:3000`

---

## 🚀 Tóm Tắt Nhanh

| Bước | Lệnh |
|------|------|
| Cài đặt backend | `cd backend && npm install` |
| Chạy backend | `cd backend && npm start` |
| Cài đặt frontend | `cd frontend && npm install` |
| Chạy frontend | `cd frontend && npm run dev` |

---

## 🛠️ Xử Lý Lỗi Thường Gặp

- **Lỗi kết nối Supabase**: Kiểm tra lại `SUPABASE_URL` và `SUPABASE_KEY` trong file `.env`.
- **Cổng bị chiếm dụng**: Đổi giá trị `PORT` trong `.env` của backend và cập nhật `VITE_API_URL` trong frontend tương ứng.
- **Lỗi thiếu package**: Xóa thư mục `node_modules` và chạy lại `npm install`.
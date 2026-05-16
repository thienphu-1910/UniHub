# Đặc tả: Đồng bộ dữ liệu sinh viên hằng đêm

## Mô tả

Hệ thống tự động nhập dữ liệu sinh viên từ file CSV export ban đêm của hệ thống cũ. Dữ liệu được chuẩn hóa, kiểm tra hợp lệ, cập nhật tài khoản sinh viên, xử lý trạng thái hoạt động và ghi nhận báo cáo nhập liệu để phục vụ đối soát.

## Luồng chính

1. Khi backend khởi động, hệ thống lên lịch job lặp bằng BullMQ với cron `STUDENT_SYNC_CRON` (mặc định 02:30) và timezone `STUDENT_SYNC_TZ` (mặc định Asia/Ho_Chi_Minh).
2. Worker nhận job `student-sync` và gọi `studentSyncService.runLatestChunk`.
3. Service tạo các thư mục đồng bộ: `incoming`, `processed`, `failed`, `reports`, `rejected`.
4. Chọn file CSV trong `incoming` theo prefix/suffix cấu hình. Nếu không có file thì trả về `skipped`.
5. Tính SHA256 để phát hiện file đã nhập trước đó. Nếu đã có bản ghi hoàn tất, chuyển file sang `processed` và bỏ qua.
6. Parse CSV, chuẩn hóa header, validate từng dòng. Dòng sai định dạng đưa vào danh sách rejected.
7. Loại trùng theo `student_id`, ưu tiên dòng có `updated_at` mới hơn.
8. Trong transaction, upsert sinh viên: tạo mới hoặc cập nhật; nếu không còn active thì hủy các đăng ký `pending/confirmed` và trả lại slot.
9. Ghi file report và (nếu có) file rejected, cập nhật bảng `student_imports` với các thống kê.
10. Di chuyển file nguồn sang `processed` nếu có bản ghi thành công, ngược lại sang `failed`.

## Kịch bản lỗi

- Không có file CSV trong `incoming`: trả về `success=true`, `skipped=true`.
- CSV lỗi định dạng/parse: chuyển file sang `failed` và trả lỗi.
- Dòng dữ liệu không hợp lệ: đưa vào file rejected, vẫn tiếp tục xử lý các dòng hợp lệ.
- Email trùng với tài khoản khác hoặc không phải role student: dòng bị reject.
- Tất cả dòng đều bị reject: import được đánh dấu `failed`.

## Ràng buộc

- Tên file mặc định: prefix `students_`, suffix `.csv` (cấu hình qua `STUDENT_SYNC_FILE_PREFIX`, `STUDENT_SYNC_FILE_SUFFIX`).
- Các cột tối thiểu: `student_id`, `full_name`, `email`, `status`, `updated_at` (có alias: `mssv`, `ho_ten`, `mail`, `is_active`, ...).
- `status` chỉ chấp nhận các giá trị active/inactive theo danh sách quy ước trong schema.
- Mật khẩu mặc định cho sinh viên mới: `STUDENT_SYNC_DEFAULT_PASSWORD` (mặc định `UniHub@123456`).
- Có thể reset mật khẩu user cũ nếu `STUDENT_SYNC_RESET_EXISTING_PASSWORD=true`.
- Concurrency của worker: `STUDENT_SYNC_CONCURRENCY` (mặc định 1).
- Thư mục gốc mặc định: `data/student-sync`, có thể override bằng các biến `STUDENT_SYNC_*_DIR`.
- Báo cáo xuất ra CSV: `reports/<timestamp>_student_sync_report.csv`, rejected: `rejected/<timestamp>_rejected_<filename>`.

## Tiêu chí chấp nhận

- Đến giờ cron, job được enqueue và worker xử lý file CSV trong `incoming`.
- Sau khi xử lý, bảng `student_imports` ghi nhận trạng thái và thống kê (created/updated/failed, password_reset, inactive...).
- File nguồn được chuyển sang `processed` khi có ít nhất một dòng hợp lệ; ngược lại chuyển sang `failed`.
- File report và rejected (nếu có) được tạo đúng định dạng.
- Gọi `POST /api/student-sync/run` có thể chạy trực tiếp (mode=direct) hoặc enqueue job; `GET /api/student-sync/imports` trả danh sách import mới nhất.

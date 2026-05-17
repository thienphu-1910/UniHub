# Đặc tả: Tính năng Điểm danh (Offline-First Check-in)

## Mô tả
Tính năng điểm danh (check-in) được thiết kế theo kiến trúc **Offline-First**, cho phép nhân viên sự kiện thực hiện quét mã và xác nhận tham gia cho sinh viên một cách mượt mà ngay cả trong điều kiện mạng chập chờn hoặc hoàn toàn không có kết nối internet. Giải pháp này tận dụng cơ sở dữ liệu cục bộ **IndexedDB** tích hợp sẵn trên đại đa số các trình duyệt web hiện đại để lưu trữ tạm thời, kết hợp với cơ chế đồng bộ hóa dữ liệu ngầm lên hệ thống cơ sở dữ liệu trung tâm (Supabase) khi mạng được khôi phục.

## Luồng chính
Quy trình từ lúc chuẩn bị sự kiện đến khi hoàn tất điểm danh diễn ra theo các bước sau:

1. **Khởi tạo dữ liệu (Yêu cầu có mạng)**: Trước khi sự kiện bắt đầu, nhân viên chọn một Workshop cụ thể trên giao diện. Trình duyệt sẽ tự động gọi API lên server để tải về toàn bộ danh sách sinh viên đã đăng ký hợp lệ kèm theo mã đăng ký (Registration Code) và lưu trữ cục bộ vào IndexedDB.
2. **Quét và Giải mã (Client-side)**: Tại quầy check-in, sinh viên xuất trình mã QR/Barcode. Frontend sử dụng thư viện đọc mã để quét, giải mã (decode) chuỗi dữ liệu và trích xuất ra mã đăng ký của sinh viên.
3. **Đối chiếu và Ghi nhận (IndexedDB)**: Frontend lấy mã vừa giải mã tiến hành truy vấn trực tiếp vào IndexedDB.
   * Nếu mã khớp với dữ liệu đã tải về, hệ thống cập nhật trạng thái bản ghi trong IndexedDB thành `isCheckin = true`.
   * Giao diện lập tức báo check-in thành công cho nhân viên mà không cần chờ phản hồi từ server.
4. **Xử lý Đồng bộ (Synchronization)**:
   * **Trường hợp có mạng (Online)**: Ngay sau khi ghi nhận vào IndexedDB, hệ thống bắn một HTTP request chứa thông tin check-in lên server để cập nhật trực tiếp.
   * **Trường hợp mất mạng (Offline)**: Yêu cầu check-in được đánh dấu là "pending sync" (chờ đồng bộ) bên trong IndexedDB. Ứng dụng lắng nghe các sự kiện thay đổi trạng thái mạng (Network Events). Khi thiết bị có mạng trở lại, một tiến trình chạy ngầm sẽ gom toàn bộ các bản ghi chưa đồng bộ và gửi lên server dưới dạng Batch Request.

## Kịch bản lỗi
### 1. Sinh viên đưa sai mã hoặc mã không tồn tại
* **Xử lý**: Khi truy vấn IndexedDB không tìm thấy mã hoặc mã thuộc về workshop khác, frontend lập tức hiển thị cảnh báo (Cờ đỏ/Âm thanh báo lỗi) và từ chối check-in.
### 2. Sự cố mất mạng khi đang đồng bộ
* **Xử lý**: Nếu request đồng bộ lên server bị timeout hoặc fail do rớt mạng giữa chừng, trạng thái bản ghi trong IndexedDB vẫn giữ nguyên là "pending sync". Hệ thống sẽ thử đồng bộ lại vào lần kết nối thành công tiếp theo, đảm bảo không thất thoát bất kỳ lượt check-in nào.

## Ràng buộc
* **Tính khả dụng của IndexedDB**: Yêu cầu ứng dụng chạy trên các trình duyệt tiêu chuẩn có hỗ trợ IndexedDB (Chrome, Firefox, Safari, Edge...).
* **Bảo mật và Dọn dẹp dữ liệu**: Dữ liệu tải về IndexedDB chỉ chứa các thông tin tối thiểu cần thiết để xác thực (mã đăng ký, tên, trạng thái), không chứa dữ liệu nhạy cảm dư thừa. Khuyến nghị có cơ chế clear IndexedDB sau khi workshop kết thúc để giải phóng bộ nhớ client.

## Tiêu chí chấp nhận
* **Đồng bộ dữ liệu thành công**: Khi kết thúc luồng hoạt động (có mạng trở lại), tất cả sinh viên được quét mã hợp lệ phải có dữ liệu lưu trữ chính xác trên **Supabase** với trạng thái đã check-in.
* **Tính lũy đẳng (Idempotency) và Chống xung đột**: 
  * Cấu trúc truy vấn khi Insert/Update dữ liệu đồng bộ lên Supabase bắt buộc phải áp dụng chiến lược **`ON CONFLICT (registration_code) DO NOTHING`** (hoặc `DO UPDATE SET is_checkin = true`).
  * **Giải quyết triệt để vấn đề Concurrency**: Dù có trường hợp nhiều thiết bị nhân viên cùng đồng bộ trạng thái check-in cho cùng 1 sinh viên (do lỗi thao tác nghiệp vụ, hoặc nghẽn mạng gây retry request), Database của Supabase vẫn chỉ ghi nhận một cách an toàn mà không sinh ra lỗi duplicate key, đảm bảo tính toàn vẹn dữ liệu tuyệt đối.

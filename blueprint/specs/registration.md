# Đặc tả: Tính năng Đăng ký Suất tham gia (High-Concurrency Registration)

## Mô tả
Tính năng này cho phép sinh viên đăng ký tham gia các sự kiện, hội thảo hoặc workshop có giới hạn số lượng chỗ ngồi trong môi trường có lưu lượng truy cập đồng thời cực lớn (high concurrency). Hệ thống áp dụng kiến trúc xử lý bất đồng bộ (asynchronous pipeline) kết hợp giữa bộ nhớ đệm Redis, hàng đợi tin nhắn BullMQ và cơ chế truyền tải thời gian thực Server-Sent Events (SSE) nhằm tối ưu hóa hiệu năng, giải tỏa áp lực trực tiếp lên Database và giải quyết triệt để bài toán tranh chấp tài nguyên (race conditions).

## Luồng chính
Luồng xử lý yêu cầu đăng ký từ lúc sinh viên thao tác cho đến khi nhận được kết quả cuối cùng bao gồm các bước sau:

1. **Gửi yêu cầu**: Sinh viên nhấn nút "Đăng ký" trên giao diện ứng dụng. Client gửi một HTTP POST request chứa thông tin đăng ký đến Backend Server.
2. **Kiểm tra & Giữ chỗ tạm thời (Redis)**: Backend Server tiếp nhận request, thực hiện kiểm tra và trừ số lượng chỗ trống (slots) trực tiếp trên Redis bằng một tác vụ nguyên tử (atomic operation) nhằm đảm bảo không xảy ra hiện tượng bán vượt số lượng (overselling).
3. **Phản hồi tạm thời**: Server lưu trạng thái xử lý tạm thời vào Redis và lập tức phản hồi về cho Client kết quả tạm thời (Xác nhận đã tiếp nhận yêu cầu và đang đưa vào hàng đợi xử lý).
4. **Đẩy vào Hàng đợi Đăng ký (BullMQ)**: Đồng thời với bước phản hồi, Server đóng gói thông tin đăng ký thành một công việc (job) rồi đẩy vào hàng đợi tin nhắn `Registration Queue` (quản lý bởi BullMQ).
5. **Xử lý bất đồng bộ (Worker)**: Worker tiến hành lắng nghe từ `Registration Queue`, lấy các job ra và thực hiện thao tác kiểm tra sau cùng trước khi tiến hành chèn dữ liệu ghi danh (Insert) chính thức vào hệ thống cơ sở dữ liệu (PostgreSQL).
6. **Xác nhận từ Database**: Cơ sở dữ liệu PostgreSQL hoàn tất việc ghi log và lưu trữ dữ liệu, trả về phản hồi thành công cho Worker. Worker đánh dấu job hoàn thành và trả về kết quả xử lý (return value).
7. **Chuyển tiếp kết quả qua Event Queue**: Một hàng đợi sự kiện độc lập khác (`Event Queue` - cũng được vận hành bởi BullMQ) sẽ tự động bắt lấy kết quả trả về từ Worker ngay khi job kết thúc thành công.
8. **Đẩy thông báo thời gian thực (SSE)**: API Server lắng nghe các sự kiện từ `Event Queue`, nhận diện chính xác định danh của sinh viên tương ứng và đẩy kết quả đăng ký thành công/thất bại cuối cùng về giao diện Client của sinh viên thông qua đường truyền Server-Sent Events (SSE) đã được thiết lập sẵn.

## Kịch bản lỗi
### 1. Sự cố sập hệ thống Redis (Redis Downtime / Connection Error)
* **Điều kiện xảy ra**: Hệ thống Redis bị crash phần cứng, mất kết nối mạng giữa API Server và cụm Redis, hoặc Redis rơi vào trạng thái quá tải không thể phản hồi tác vụ trừ slot.
* **Cách xử lý của hệ thống**:
  * Ngay khi phát hiện không thể kết nối hoặc thao tác với Redis, API Server lập tức kích hoạt cơ chế ngắt mạch tự động (**Circuit Breaker**).
  * Mọi yêu cầu đăng ký mới từ phía sinh viên sẽ bị chặn ngay tại tầng API Server.
  * Hệ thống trả về mã phản hồi lỗi dịch vụ tạm thời (e.g., `503 Service Unavailable`) đi kèm thông báo tường minh trên giao diện ("Hệ thống đang bận, vui lòng thử lại sau").
  * Cơ chế này giúp người dùng không bị rơi vào trạng thái treo request (timeout) vô tận, đồng thời bảo vệ hệ thống hạ tầng phía sau một cách an toàn.

## Ràng buộc
* **Tính nhất quan dữ liệu tối cao (Data Consistency)**: Khi hệ thống Redis gặp sự cố, **mọi hoạt động đăng ký của hệ thống phải được tạm ngưng ngay lập tức**. Tuyệt đối không cho phép luồng dữ liệu đi đường vòng (bypass qua Redis để ghi thẳng vào PostgreSQL) nhằm tránh hiện tượng sụt giảm hiệu năng nghiêm trọng và sai lệch số lượng suất đăng ký thực tế (Race Condition).
* **Độ trễ thấp ở tầng tiếp nhận**: Tầng API Server bắt buộc phải phản hồi kết quả tạm thời về cho Client trong vòng vài mili-giây nhằm giải phóng nhanh connection pool, nhường toàn bộ tiến trình I/O ghi đĩa nặng nề cho các Worker xử lý bất đồng bộ dưới nền.

## Tiêu chí chấp nhận
* **Tính năng hoạt động đúng**: Tính năng đăng ký được xác nhận là phân hệ hoạt động chính xác khi và chỉ khi sinh viên nhận được thông báo trạng thái "Thành công" thông qua kênh truyền SSE, đồng thời toàn bộ bản ghi thông tin đăng ký (Student ID, Workshop ID, Trạng thái, Timestamp) được **lưu trữ chính xác, đầy đủ và nhất quán bên trong cơ sở dữ liệu PostgreSQL**.
* **Độ tin cậy khi xảy ra lỗi**: Khi tiến hành giả lập tắt Redis (Chaos Engineering), hệ thống phải từ chối các request đăng ký mới một cách an toàn, không sinh ra exception không kiểm soát (unhandled exception) và đảm bảo không có bất kỳ dòng dữ liệu lỗi hoặc vượt hàng chờ nào được phép ghi nhận vào PostgreSQL.

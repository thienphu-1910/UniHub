# UniHub Workshop — Project Proposal

## Vấn đề
Trường Đại học A tổ chức "Tuần lễ kỹ năng và nghề nghiệp" hàng năm với quy mô ngày càng lớn — 5 ngày, mỗi ngày 8–12 workshop diễn ra song song. Hiện tại ban tổ chức quản lý đăng ký bằng Google Form và thông báo qua email thủ công.

Quy trình này không còn đáp ứng được nhu cầu vì các lý do cụ thể sau:
- **Không kiểm soát được chỗ ngồi theo thời gian thực:** Google Form không có cơ chế giới hạn số lượng đăng ký đồng thời, dẫn đến overbooking khi nhiều sinh viên cùng submit trong vài giây.
- **Không có cơ chế check-in:** Ban tổ chức phải đối chiếu thủ công danh sách tại cửa phòng, tốn thời gian và dễ sai sót.
- **Thông báo thủ công:** Email xác nhận được gửi bằng tay, không có khả năng mở rộng khi số lượng đăng ký lớn.
- **Không hỗ trợ thanh toán:** Workshop có thu phí không có luồng thanh toán tích hợp, buộc ban tổ chức xử lý ngoài hệ thống.
- **Không tích hợp dữ liệu sinh viên:** Không có cách xác thực tư cách sinh viên khi đăng ký, dẫn đến nguy cơ đăng ký sai đối tượng.

## Mục tiêu
Xây dựng hệ thống UniHub Workshop để số hóa toàn bộ quy trình từ đăng ký đến check-in, đạt được các mục tiêu cụ thể sau:

- Hỗ trợ **~12.000 sinh viên** truy cập trong 10 phút đầu mở đăng ký (60% dồn vào 3 phút đầu) mà không để backend quá tải.
- Đảm bảo **không có hai sinh viên nào cùng nhận được chỗ cuối cùng** của một workshop (tránh race condition khi đăng ký đồng thời).
- Cho phép **check-in bằng mã QR** tại cửa phòng, hoạt động được cả khi mất kết nối mạng.
- Xử lý thanh toán **không trừ tiền hai lần** dù client retry hoặc gateway timeout.
- Đồng bộ dữ liệu sinh viên từ hệ thống cũ **mỗi đêm** mà không làm gián đoạn hệ thống đang chạy.
- Hỗ trợ **bổ sung kênh thông báo mới** (ví dụ: Telegram) mà không cần thay đổi logic nghiệp vụ.

## Người dùng và nhu cầu

| Nhóm | Nhu cầu chính | Điều quan trọng nhất |
|---|---|---|
| **Sinh viên** | Xem lịch, đăng ký workshop, nhận mã QR, check-in khi tham dự | Trải nghiệm đăng ký nhanh, công bằng, không lỗi giữa chừng |
| **Ban tổ chức** | Tạo/sửa/hủy workshop, theo dõi số lượng đăng ký, xem thống kê | Kiểm soát toàn bộ sự kiện từ một giao diện admin duy nhất |
| **Nhân sự check-in** | Quét mã QR xác nhận sinh viên tại cửa phòng | Hoạt động được khi mạng không ổn định |

## Phạm vi

**Thuộc phạm vi đồ án:**
- Hệ thống xem và đăng ký workshop (có phí và miễn phí)
- Thông báo xác nhận qua app và email; thiết kế hỗ trợ mở rộng kênh mới
- Trang web admin cho ban tổ chức; phân quyền theo ba nhóm người dùng
- Mobile app check-in bằng mã QR, hỗ trợ offline và tự đồng bộ
- Tính năng AI Summary: tải PDF, tự động tóm tắt và hiển thị trên trang chi tiết workshop
- Đồng bộ dữ liệu sinh viên từ file CSV export đêm của hệ thống cũ
- Các cơ chế bảo vệ: rate limiting, circuit breaker, idempotency key

**Không thuộc phạm vi:**
- Tích hợp cổng thanh toán thật (sẽ dùng mock/sandbox)
- Hạ tầng production thực tế (triển khai trên môi trường phát triển/local)
- API hai chiều với hệ thống quản lý sinh viên của trường (chỉ đọc CSV một chiều)
- Ứng dụng mobile native đầy đủ tính năng (chỉ tập trung vào chức năng check-in)

## Rủi ro và ràng buộc

**Tranh chấp chỗ ngồi (Race condition):** Workshop chỉ có 60 chỗ nhưng có thể có hàng trăm sinh viên đăng ký đồng thời. Cần cơ chế đảm bảo tính nhất quán — dự kiến giải quyết bằng optimistic locking hoặc distributed lock ở tầng database.

**Tải trọng đột biến:** ~12.000 sinh viên trong 10 phút, 60% dồn vào 3 phút đầu. Cần rate limiting để bảo vệ backend API, ngăn client spam request và đảm bảo công bằng giữa các sinh viên.

**Cổng thanh toán không ổn định:** Khi gateway lỗi hoặc timeout, luồng đăng ký có phí không được trừ tiền hai lần; các tính năng không liên quan đến thanh toán phải tiếp tục hoạt động bình thường. Dự kiến xử lý bằng circuit breaker và idempotency key.

**Check-in offline:** Khu vực trong trường có thể mất mạng. App phải ghi nhận check-in tạm thời cục bộ và đồng bộ lên server khi kết nối trở lại mà không mất dữ liệu.

**Tích hợp một chiều với hệ thống cũ:** Không thể gọi API — chỉ đọc được file CSV export theo lịch cố định mỗi đêm. Luồng nhập dữ liệu phải xử lý được file lỗi, dữ liệu trùng lặp và không làm gián đoạn hệ thống đang chạy.
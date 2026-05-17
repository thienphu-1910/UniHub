# Đặc tả: Thông báo (Notification)

## Mô tả

Tính năng gửi thông báo cho người dùng sau các sự kiện quan trọng trong hệ thống. Hiện tại hệ thống hỗ trợ **gửi email xác nhận đăng ký workshop thành công** kèm mã QR check-in. Kiến trúc được thiết kế theo **Strategy Pattern** — cho phép mở rộng thêm kênh thông báo mới (SMS, push notification, v.v.) mà không cần thay đổi logic nghiệp vụ. Thông báo được gửi theo kiểu **best-effort**: lỗi gửi thông báo không ảnh hưởng đến luồng thanh toán chính.

---

## Luồng chính

### Gửi email xác nhận đăng ký

```
paymentService.processWebhook (status = "success")
    → registrationRepository.getRegistrationWithDetails(registrationId)
        → Lấy { email, fullName, workshopTitle, room }
    → buildRegistrationSuccessEmail({ fullName, workshopTitle, room, quickChartUrl })
        → Tạo { subject, html } từ template
    → new NotificationContext(new NodemailerStrategy())
    → context.send({ to: email, subject, html })
        → NodemailerStrategy.send()
            → nodemailer transporter.sendMail()
                → Gmail SMTP
```

**Các thành phần tham gia:**

| Thành phần | Vai trò |
|---|---|
| `payment.service.js` | Trigger gửi thông báo sau khi payment success |
| `notificationStrategy.js` | Abstract base class định nghĩa interface `send()` |
| `nodemailerStrategy.js` | Concrete strategy — gửi email qua Nodemailer/Gmail |
| `notificationContext.js` | Context class — nhận strategy, gọi `strategy.send()` |
| `emailTemplate.js` | Tạo nội dung HTML email từ dữ liệu đăng ký |
| `mail.js` | Cấu hình SMTP (service, auth, from) từ biến môi trường |
| `registrationRepository` | Cung cấp thông tin chi tiết để render email |

---

### Cấu trúc Strategy Pattern

```
NotificationStrategy (abstract)
    └── send(payload): throws Error nếu không override

NodemailerStrategy extends NotificationStrategy
    └── send({ to, subject, html, text }): gửi qua Gmail SMTP

NotificationContext
    └── constructor(strategy): validate strategy instanceof NotificationStrategy
    └── send(payload): delegate đến strategy.send(payload)
```

Để thêm kênh mới (ví dụ SMS), chỉ cần tạo `SmsStrategy extends NotificationStrategy` và truyền vào `NotificationContext` — không đụng vào code hiện có.

---

### Nội dung email

Email xác nhận đăng ký workshop bao gồm:
- Lời chúc mừng kèm tên đầy đủ của người đăng ký
- Tên workshop và số phòng
- Ảnh QR code (300×300, nhúng trực tiếp qua `<img src="...">` từ QuickChart)
- Hướng dẫn liên hệ ban tổ chức

---

## Kịch bản lỗi

| Tình huống | Hành vi hiện tại |
|---|---|
| `getRegistrationWithDetails` trả về `null` hoặc thiếu `email` | Bỏ qua, không gửi email, không throw lỗi |
| SMTP thất bại (sai credentials, mất kết nối, Gmail rate limit) | Catch exception, log `"Failed to send registration email"`, tiếp tục bình thường |
| `buildRegistrationSuccessEmail` throw lỗi (dữ liệu null/undefined) | Được bắt bởi `try/catch` bên ngoài, không ảnh hưởng luồng chính |
| Strategy không extend `NotificationStrategy` | `NotificationContext` constructor throw `"strategy must extend NotificationStrategy"` |
| `send()` gọi trên base class `NotificationStrategy` trực tiếp | Throw `"send() must be implemented by concrete strategy"` |
| Biến môi trường `EMAIL_USER` / `EMAIL_PASS` không được set | Nodemailer dùng chuỗi rỗng → xác thực SMTP thất bại tại runtime |

---

## Ràng buộc

### Tính tách biệt (Isolation)
- Toàn bộ logic gửi thông báo được bọc trong `try/catch` riêng biệt — **lỗi notification không được phép làm fail luồng thanh toán**.
- Notification chỉ được trigger sau khi DB đã cập nhật thành công và Redis Pub/Sub đã publish xong.

### Mở rộng (Extensibility)
- Mọi kênh thông báo mới phải extend `NotificationStrategy` và implement `send()`.
- `NotificationContext` enforce constraint này tại constructor — không thể truyền object tùy tiện.

### Bảo mật
- Credentials SMTP (`EMAIL_USER`, `EMAIL_PASS`) lấy từ biến môi trường, không hardcode.
- QR code URL được tạo từ `registrationId` đã **mã hóa** (`encrypt`) — không lộ ID nội bộ trong email.

### Hiệu năng
- Email được gửi **synchronous** (await) trong luồng xử lý webhook — có thể gây delay nếu SMTP chậm.
- Không có cơ chế retry: nếu gửi thất bại, email bị mất vĩnh viễn.
- Mỗi lần payment success tạo một `NodemailerStrategy` và `NotificationContext` mới (không reuse transporter).

### Template
- Nội dung email dùng **inline style** (tương thích cao với các email client).
- QR code được nhúng dưới dạng external URL từ QuickChart — yêu cầu email client render ảnh từ internet.

---

## Tiêu chí chấp nhận

### Gửi email thành công
- [ ] Sau khi payment success, email được gửi đến đúng địa chỉ email của người đăng ký
- [ ] Email có subject: `"Đăng ký workshop thành công: {workshopTitle}"`
- [ ] Email hiển thị đúng `fullName`, `workshopTitle`, `room`, và ảnh QR code
- [ ] QR code URL trỏ đúng đến `quickChartUrl` được tạo từ `registrationId` đã mã hóa

### Best-effort — không ảnh hưởng luồng chính
- [ ] Khi SMTP thất bại → payment vẫn được cập nhật DB thành công, SSE vẫn nhận `PAYMENT_SUCCESS`
- [ ] Khi `getRegistrationWithDetails` trả về `null` → không có exception nào được throw ra ngoài
- [ ] Lỗi gửi email được log rõ ràng với message `"Failed to send registration email"`

### Strategy Pattern
- [ ] Truyền object không phải instance của `NotificationStrategy` vào `NotificationContext` → throw lỗi ngay tại constructor
- [ ] Có thể swap strategy (ví dụ dùng `SmsStrategy`) mà không cần sửa `payment.service.js`

### Cấu hình
- [ ] Khi `EMAIL_USER` và `EMAIL_PASS` được set đúng → email đến hộp thư thành công
- [ ] Khi thiếu biến môi trường → lỗi được catch và log, không crash server

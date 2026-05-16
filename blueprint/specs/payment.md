# Đặc tả: Thanh toán (Payment)

## Mô tả

Tính năng xử lý thanh toán cho một lượt đăng ký (`registration`). Luồng được thiết kế theo mô hình **bất đồng bộ**: yêu cầu thanh toán được đưa vào hàng đợi (BullMQ) thay vì xử lý trực tiếp, giúp tránh timeout và tăng khả năng chịu tải. Kết quả thanh toán (thành công / thất bại) được đẩy về client theo thời gian thực qua **Server-Sent Events (SSE)**. Tính năng hỗ trợ idempotency để đảm bảo mỗi yêu cầu chỉ được xử lý đúng một lần.

---

## Luồng chính

### 1. Khởi tạo thanh toán

```
Client → POST /payments
       → paymentController.initiatePayment
       → paymentService.initiatePayment
           → Kiểm tra idempotency key trong Redis
           → Nếu chưa tồn tại: set key với TTL 1 giờ, đưa job vào paymentQueue
           → Trả về { status: "queued" }
```

**Các thành phần tham gia:**
- `payment.route.js` — định nghĩa endpoint `POST /payments`
- `payment.controller.js` — validate đầu vào, gọi service
- `payment.service.js` (`initiatePayment`, `addPaymentJob`) — kiểm tra idempotency, enqueue job
- **Redis** — lưu trạng thái idempotency key
- **BullMQ Queue** (`paymentQueue`) — nhận job xử lý thanh toán

---

### 2. Xử lý thanh toán (background)

```
paymentWorker (BullMQ Worker)
    → Lấy job từ paymentQueue
    → Giả lập xử lý gateway (MockGateway, delay 2 giây)
    → Kết quả success/failed → gọi processWebhook
```

**Các thành phần tham gia:**
- `payment.worker.js` — consumer của hàng đợi, simulate gateway call
- `payment.service.js` (`processWebhook`) — cập nhật DB và publish kết quả lên Redis Pub/Sub

---

### 3. Webhook / cập nhật kết quả

```
POST /payments/webhook (từ gateway thực, hoặc từ worker)
    → paymentController.handlePaymentWebhook
    → paymentService.processWebhook
        → Nếu success:
            → Mã hóa registrationId → tạo QR code URL
            → paymentRepository.updatePaymentSuccess (cập nhật payments + registrations)
            → Redis PUBLISH channel-{registrationId}: { type: "PAYMENT_SUCCESS", ... }
        → Nếu failed:
            → paymentRepository.updatePaymentFailed (cập nhật payments)
            → Redis PUBLISH channel-{registrationId}: { type: "PAYMENT_FAILED", ... }
```

**Các thành phần tham gia:**
- `payment.controller.js` (`handlePaymentWebhook`)
- `payment.service.js` (`processWebhook`)
- `payment.repository.js` — ghi kết quả vào DB (`payments`, `registrations`)
- **Redis Pub/Sub** — broadcast sự kiện đến các client đang lắng nghe

---

### 4. Nhận kết quả real-time (SSE)

```
Client → GET /payments/stream/:registrationId
       → paymentController.streamEvents
           → Subscribe Redis channel-{registrationId}
           → Gửi SSE events về client khi có message
           → Keepalive ping mỗi 20 giây
           → Dọn dẹp khi client disconnect
```

**Các thành phần tham gia:**
- `payment.controller.js` (`streamEvents`, `sseSubscriber`, `channelClients`)
- **Redis Pub/Sub** — nhận sự kiện từ service

---

## Kịch bản lỗi

| Tình huống | Hành vi hiện tại |
|---|---|
| `registrationId`, `amount`, hoặc `idempotencyKey` thiếu | Controller trả về `400 Bad Request` |
| Idempotency key đã tồn tại trong Redis | `addPaymentJob` trả về `false` → service throw `"Payment request has already been received"` → controller trả về `500` |
| Job trong queue bị lỗi (worker crash) | BullMQ retry theo cấu hình mặc định; lỗi được log nhưng **không** re-throw (job âm thầm thất bại) |
| Gateway trả về failed | Worker gọi `processWebhook` với `status: "failed"` → cập nhật DB → publish `PAYMENT_FAILED` |
| Lỗi DB trong repository | `try/catch` log lỗi và trả về `false`, **không** bubble lên service/controller |
| Client SSE ngắt kết nối | `req.on("close")` dọn dẹp client khỏi `channelClients`, unsubscribe Redis nếu không còn client nào |
| Redis mất kết nối | Các thao tác Redis sẽ throw exception; hiện không có cơ chế fallback/retry tường minh |
| Webhook thiếu `registrationId`, `status`, `gateway`, `rawResponse` | Controller trả về `400 Bad Request` |

---

## Ràng buộc

### Idempotency
- Mỗi `idempotencyKey` chỉ được xử lý **một lần** trong vòng **1 giờ** (TTL Redis).
- Job được tạo với `jobId: idempotencyKey` — BullMQ tự deduplicate nếu job cùng ID đã tồn tại trong queue.

### Bảo mật
- `registrationId` được **mã hóa** (`encrypt`) trước khi nhúng vào QR code — tránh lộ ID nội bộ.
- Redis password được lấy từ biến môi trường (`REDIS_PASSWORD`), không hardcode.

### Hiệu năng
- Thanh toán xử lý **bất đồng bộ** — request trả về ngay sau khi enqueue, không block HTTP thread.
- SSE keepalive mỗi **20 giây** để tránh proxy/firewall đóng kết nối idle.
- Mỗi Redis channel chỉ được subscribe **một lần** cho dù nhiều client cùng lắng nghe cùng `registrationId` (dùng `channelClients` Map để fan-out trong process).

### Tính nhất quán dữ liệu
- Khi payment success: cập nhật cả bảng `payments` **và** `registrations` trong cùng một xử lý — nếu một lệnh SQL thất bại, lệnh kia vẫn có thể đã chạy (chưa có transaction bọc ngoài).
- Trạng thái Redis idempotency được set **trước** khi enqueue — nếu enqueue thất bại, key vẫn tồn tại và sẽ chặn retry trong 1 giờ.

---

## Tiêu chí chấp nhận

### Luồng thành công
- [ ] `POST /payments` với đầy đủ `registrationId`, `amount`, `idempotencyKey` → trả về `200` với `status: "queued"`
- [ ] Client kết nối SSE tại `/payments/stream/:registrationId` trước khi thanh toán hoàn tất → nhận được event `PAYMENT_SUCCESS` kèm `qrCodeData` và `quickChartUrl`
- [ ] Bảng `payments` được cập nhật `status = SUCCESS`, `gateway_txn_id`, `gateway_response`
- [ ] Bảng `registrations` được cập nhật `status = CONFIRMED`, `qr_code`, `qr_code_url`, `confirmed_at`

### Idempotency
- [ ] Gửi cùng `idempotencyKey` hai lần → lần hai trả về lỗi `"Payment request has already been received"`
- [ ] Không có duplicate job trong BullMQ queue

### Luồng thất bại
- [ ] Khi gateway trả về failed → client SSE nhận event `PAYMENT_FAILED`
- [ ] Bảng `payments` được cập nhật `status = FAILED`

### Validation
- [ ] Thiếu bất kỳ trường bắt buộc nào → API trả về `400 Bad Request` với message mô tả rõ

### SSE
- [ ] Nhiều client cùng lắng nghe một `registrationId` → tất cả đều nhận được event
- [ ] Client ngắt kết nối → server dọn dẹp đúng cách, không memory leak
- [ ] Keepalive comment (`:`) được gửi mỗi 20 giây khi không có event

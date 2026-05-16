# Đặc tả: AI Summary

## Mô tả

Tính năng cho phép ban tổ chức upload tài liệu PDF của workshop; hệ thống tự động trích xuất văn bản, làm sạch, gửi đến dịch vụ AI để tạo bản tóm tắt ngắn (2-4 câu) và lưu vào workshop để hiển thị ở trang chi tiết.

## Luồng chính

1. Ban tổ chức gọi `POST /api/workshops` (multipart/form-data) kèm file `pdf` và các trường thông tin workshop.
2. Middleware upload nhận file PDF vào bộ nhớ và validation kiểm tra định dạng, kích thước.
3. Service trích xuất văn bản từ PDF, chuẩn hóa khoảng trắng và cắt theo giới hạn ký tự.
4. Hệ thống gọi API AI (Groq chat completions) với prompt tóm tắt và cấu hình model/tokens.
5. Kết quả tóm tắt được lưu vào `workshops.ai_summary`, trạng thái lưu vào `workshops.summary_status`.
6. API trả về workshop vừa tạo; trang chi tiết workshop hiển thị `aiSummary` (nếu có).

## Kịch bản lỗi

- Không có `AI_API_KEY`: trả về `summaryStatus = failed`, `aiSummary` rỗng; workshop vẫn được tạo.
- Lỗi gọi AI hoặc timeout: `summaryStatus = failed`, `aiSummary` rỗng.
- PDF không có nội dung trích xuất được: `summaryStatus = failed`, `aiSummary` rỗng.
- Không upload PDF: `summaryStatus = none`, `aiSummary` rỗng.
- File sai định dạng hoặc vượt kích thước: request bị từ chối ở bước validation.

## Ràng buộc

- File PDF bắt buộc đúng MIME `application/pdf`, giới hạn kích thước 20MB.
- Nội dung gửi sang AI bị cắt theo `AI_SUMMARY_MAX_CHARS` (mặc định 12000 ký tự).
- Số token tóm tắt giới hạn bởi `AI_SUMMARY_MAX_TOKENS` (mặc định 300).
- Timeout gọi AI: 20 giây.
- Model mặc định: `llama-3.1-8b-instant` (có thể cấu hình qua `AI_MODEL`).
- Giá trị `summaryStatus` hiện tại: `none`, `generated`, `failed`.

## Tiêu chí chấp nhận

- Khi upload PDF hợp lệ và có `AI_API_KEY`, workshop được tạo với `aiSummary` không rỗng và `summaryStatus = generated`.
- Khi không upload PDF, workshop vẫn được tạo và `summaryStatus = none`.
- Khi AI lỗi hoặc thiếu `AI_API_KEY`, workshop vẫn được tạo và `summaryStatus = failed`.
- Trang chi tiết workshop hiển thị `aiSummary` nếu có; nếu không, hiển thị thông báo không có tóm tắt.

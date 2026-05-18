-- Seed data for users with different roles
-- Passwords are hashed using PostgreSQL pgcrypto's crypt() + gen_salt('bf')

INSERT INTO users (student_id, email, full_name, role, password_hash)
VALUES
  ('STU001', 'student@unihub.edu', 'Nguyen Van A', 'student'::user_role_enum, crypt('student123', gen_salt('bf', 10))),
  (NULL, 'organizer@unihub.edu', 'Tran Thi B', 'organizer'::user_role_enum, crypt('organizer123', gen_salt('bf', 10))),
  (NULL, 'staff@unihub.edu', 'Le Van C', 'checkin_staff'::user_role_enum, crypt('staff123', gen_salt('bf', 10)));

-- ============================================================
--  SEED DATA: workshops
--  Lưu ý: created_by để NULL (không bắt buộc)
--          Điều chỉnh UUID của created_by nếu bảng users đã có dữ liệu
-- ============================================================


INSERT INTO workshops (
    title,
    description,
    ai_summary,
    summary_status,
    speaker,
    room,
    room_diagram,
    start_time,
    end_time,
    capacity,
    available_slots,
    is_paid,
    price,
    status,
    pdf_file_url,
    created_by,
    registration_start_time,
    registration_end_time,
    is_active
) VALUES

-- 1. Workshop miễn phí - AI cơ bản
(
    'Nhập môn Trí tuệ Nhân tạo cho người mới bắt đầu',
    'Workshop cung cấp kiến thức nền tảng về AI, machine learning và ứng dụng thực tế trong cuộc sống hằng ngày. Không yêu cầu kiến thức lập trình trước.',
    'Buổi workshop giới thiệu tổng quan AI, phân biệt AI/ML/Deep Learning và demo các ứng dụng thực tế như nhận diện giọng nói, ảnh.',
    'completed'::summary_status_enum,
    '{"name": "Nguyễn Văn An", "bio": "5 năm kinh nghiệm nghiên cứu AI tại các tập đoàn lớn.", "avatarUrl": "https://example.com/avatars/nguyen-van-an.jpg"}',
    'Phòng A101',
    '{"svg_url": "https://example.com/diagrams/room-a101.svg", "seats": 50, "layout": "theater"}',
    '2025-08-15 08:30:00+07',
    '2025-08-15 11:30:00+07',
    50,
    12,
    false,
    0.00,
    'scheduled'::workshop_status_enum,
    NULL,
    NULL,
    '2025-07-01 00:00:00+07',
    '2025-08-14 23:59:00+07',
    true
),

-- 2. Workshop có phí - Lập trình Python
(
    'Python cho Data Science: Từ Zero đến Hero',
    'Khóa học thực hành chuyên sâu về Python ứng dụng trong phân tích dữ liệu. Học viên sẽ thực hành trực tiếp với các bộ dữ liệu thực tế sử dụng Pandas, NumPy và Matplotlib.',
    'Workshop thực hành Python Data Science bao gồm xử lý dữ liệu với Pandas, trực quan hóa với Matplotlib và bài tập phân tích dataset thực tế.',
    'completed'::summary_status_enum,
    '{"name": "Trần Thị Bích", "bio": "8 năm kinh nghiệm Data Science, chuyên gia phân tích dữ liệu người dùng.", "avatarUrl": "https://example.com/avatars/tran-thi-bich.jpg"}',
    'Phòng Lab B203',
    '{"svg_url": "https://example.com/diagrams/room-b203.svg", "seats": 30, "layout": "lab"}',
    '2025-08-16 09:00:00+07',
    '2025-08-16 17:00:00+07',
    30,
    5,
    true,
    350000.00,
    'scheduled'::workshop_status_enum,
    'https://example.com/pdfs/python-data-science-handout.pdf',
    NULL,
    '2025-07-10 00:00:00+07',
    '2025-08-15 23:59:00+07',
    true
),

-- 3. Workshop miễn phí - Web Development
(
    'Xây dựng REST API với Node.js và Express',
    'Hướng dẫn thiết kế và xây dựng RESTful API chuyên nghiệp với Node.js, Express và PostgreSQL. Bao gồm xác thực JWT, phân quyền và triển khai lên cloud.',
    'Workshop thực hành xây dựng REST API hoàn chỉnh: thiết kế endpoint, kết nối database, xác thực JWT và deploy lên Railway.',
    'none'::summary_status_enum,
    '{"name": "Lê Minh Khoa", "bio": "Developer với 6 năm kinh nghiệm, đóng góp nhiều dự án mã nguồn mở.", "avatarUrl": "https://example.com/avatars/le-minh-khoa.jpg"}',
    'Phòng C305',
    '{"svg_url": "https://example.com/diagrams/room-c305.svg", "seats": 40, "layout": "classroom"}',
    '2025-09-05 13:00:00+07',
    '2025-09-05 17:00:00+07',
    40,
    40,
    false,
    0.00,
    'scheduled'::workshop_status_enum,
    NULL,
    NULL,
    '2025-08-01 00:00:00+07',
    '2025-09-04 23:59:00+07',
    true
),

-- 4. Workshop có phí - UI/UX Design
(
    'Thiết kế UI/UX chuyên nghiệp với Figma',
    'Workshop chuyên sâu về quy trình thiết kế sản phẩm số từ nghiên cứu người dùng đến prototype có thể tương tác. Học viên sẽ hoàn thiện một case study thực tế.',
    'Học quy trình UX Research, wireframing, tạo design system và prototype tương tác với Figma trong một dự án thực tế.',
    'none'::summary_status_enum,
    '{"name": "Phạm Hồng Nhung", "bio": "Thiết kế sản phẩm cho hơn 10 triệu người dùng tại Tiki.", "avatarUrl": "https://example.com/avatars/pham-hong-nhung.jpg"}',
    'Phòng D102',
    '{"svg_url": "https://example.com/diagrams/room-d102.svg", "seats": 25, "layout": "workshop"}',
    '2025-09-20 08:00:00+07',
    '2025-09-21 17:00:00+07',
    25,
    18,
    true,
    500000.00,
    'scheduled'::workshop_status_enum,
    'https://example.com/pdfs/ux-figma-workbook.pdf',
    NULL,
    '2025-08-15 00:00:00+07',
    '2025-09-19 23:59:00+07',
    true
),

-- 5. Workshop đã kết thúc - Cybersecurity
(
    'An toàn thông tin và Đạo đức Hacker',
    'Giới thiệu về các kỹ thuật tấn công phổ biến và cách phòng thủ. Workshop thực hành trên môi trường sandbox an toàn, không áp dụng ngoài thực tế.',
    'Tổng quan về OWASP Top 10, thực hành phát hiện lỗ hổng SQL Injection và XSS trên môi trường lab kiểm soát.',
    'completed'::summary_status_enum,
    '{"name": "Đỗ Thanh Tùng", "bio": "Chuyên gia bảo mật với nhiều chứng chỉ CEH, OSCP.", "avatarUrl": "https://example.com/avatars/do-thanh-tung.jpg"}',
    'Phòng Lab E201',
    '{"svg_url": "https://example.com/diagrams/room-e201.svg", "seats": 20, "layout": "lab"}',
    '2025-06-10 09:00:00+07',
    '2025-06-10 16:00:00+07',
    20,
    0,
    true,
    200000.00,
    'completed'::workshop_status_enum,
    'https://example.com/pdfs/cybersec-slides.pdf',
    NULL,
    '2025-05-01 00:00:00+07',
    '2025-06-09 23:59:00+07',
    true
),

-- 6. Workshop bị hủy
(
    'Blockchain và Ứng dụng trong Tài chính',
    'Tổng quan về công nghệ blockchain, smart contract và ứng dụng DeFi. Workshop sẽ trình bày cách blockchain thay đổi hệ thống tài chính truyền thống.',
    NULL,
    'none'::summary_status_enum,
    '{"name": "Hoàng Việt Dũng", "bio": "Phát triển hơn 15 smart contract trên nhiều blockchain khác nhau.", "avatarUrl": "https://example.com/avatars/hoang-viet-dung.jpg"}',
    'Phòng A202',
    '{"svg_url": "https://example.com/diagrams/room-a202.svg", "seats": 60, "layout": "theater"}',
    '2025-07-20 14:00:00+07',
    '2025-07-20 17:00:00+07',
    60,
    60,
    false,
    0.00,
    'cancelled'::workshop_status_enum,
    NULL,
    NULL,
    '2025-06-15 00:00:00+07',
    '2025-07-19 23:59:00+07',
    false
),

-- 7. Workshop có phí - Cloud Computing
(
    'Triển khai ứng dụng với Docker và Kubernetes',
    'Workshop thực hành container hóa ứng dụng với Docker và quản lý cluster với Kubernetes. Bao gồm CI/CD pipeline cơ bản với GitHub Actions.',
    NULL,
    'none'::summary_status_enum,
    '{"name": "Vũ Thị Lan", "bio": "Chuyên gia DevOps với kinh nghiệm vận hành hệ thống quy mô lớn.", "avatarUrl": "https://example.com/avatars/vu-thi-lan.jpg"}',
    'Phòng Lab B301',
    '{"svg_url": "https://example.com/diagrams/room-b301.svg", "seats": 20, "layout": "lab"}',
    '2025-10-10 09:00:00+07',
    '2025-10-10 17:00:00+07',
    20,
    20,
    true,
    450000.00,
    'scheduled'::workshop_status_enum,
    NULL,
    NULL,
    '2025-09-01 00:00:00+07',
    '2025-10-09 23:59:00+07',
    true
),

-- 8. Workshop miễn phí - Soft skills
(
    'Kỹ năng Thuyết trình và Giao tiếp trong Môi trường Công nghệ',
    'Workshop giúp các kỹ sư phần mềm và nhà khoa học dữ liệu nâng cao kỹ năng trình bày ý tưởng kỹ thuật cho khán giả phi kỹ thuật một cách hiệu quả.',
    NULL,
    'none'::summary_status_enum,
    '{"name": "Ngô Minh Châu", "bio": "Quản lý đội nhóm 20+ kỹ sư, diễn giả tại nhiều tech conference.", "avatarUrl": "https://example.com/avatars/ngo-minh-chau.jpg"}',
    'Phòng Hội thảo F001',
    '{"svg_url": "https://example.com/diagrams/room-f001.svg", "seats": 80, "layout": "theater"}',
    '2025-10-25 13:30:00+07',
    '2025-10-25 16:30:00+07',
    80,
    55,
    false,
    0.00,
    'scheduled'::workshop_status_enum,
    NULL,
    NULL,
    '2025-09-20 00:00:00+07',
    '2025-10-24 23:59:00+07',
    true
);
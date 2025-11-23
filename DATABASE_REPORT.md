# BÁO CÁO CƠ SỞ DỮ LIỆU - HỆ THỐNG QUẢN LÝ NHÀ TRỌ STAYMATE

## MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Các bảng dữ liệu](#các-bảng-dữ-liệu)
3. [Các hàm (Functions)](#các-hàm-functions)
4. [Các trigger](#các-trigger)
5. [Các enum](#các-enum)
6. [Sơ đồ quan hệ](#sơ-đồ-quan-hệ)

---

## TỔNG QUAN

Hệ thống quản lý nhà trọ StayMate sử dụng PostgreSQL database trên nền tảng Supabase. Database được thiết kế để quản lý toàn bộ quy trình từ quản lý tài sản, người thuê, hợp đồng, hóa đơn, thanh toán, bảo trì và chat.

---

## CÁC BẢNG DỮ LIỆU

### 1. BẢNG `properties` (Nhà trọ/Tài sản)

**Mục đích:** Lưu trữ thông tin các nhà trọ/tài sản mà chủ nhà quản lý.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất của nhà trọ
- `name` (VARCHAR): Tên nhà trọ
- `address` (VARCHAR): Địa chỉ nhà trọ
- `ward` (VARCHAR): Phường/Xã
- `city` (VARCHAR): Thành phố/Tỉnh
- `owner_id` (UUID, FOREIGN KEY → `users.userid`): ID của chủ nhà sở hữu
- `is_active` (BOOLEAN): Trạng thái hoạt động (true = đang hoạt động)
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete, NULL = chưa xóa)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật cuối

**Quan hệ:**
- Một nhà trọ thuộc về một chủ nhà (`owner_id` → `users.userid`)
- Một nhà trọ có nhiều phòng (`rooms.property_id` → `properties.id`)
- Một nhà trọ có nhiều dịch vụ (`services.property_id` → `properties.id`)

**Ý nghĩa:**
- Bảng này là cấp cao nhất trong hệ thống, quản lý các tài sản bất động sản
- Sử dụng soft delete để giữ lại lịch sử dữ liệu
- `is_active` cho phép tạm thời vô hiệu hóa nhà trọ mà không xóa dữ liệu

---

### 2. BẢNG `rooms` (Phòng)

**Mục đích:** Lưu trữ thông tin các phòng trong nhà trọ.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất của phòng
- `code` (VARCHAR): Mã phòng (ví dụ: P101, P102)
- `name` (VARCHAR): Tên phòng
- `property_id` (UUID, FOREIGN KEY → `properties.id`): ID nhà trọ chứa phòng này
- `status` (ENUM): Trạng thái phòng (VACANT, OCCUPIED, MAINTENANCE)
- `capacity` (INTEGER): Sức chứa tối đa (số người)
- `current_occupants` (INTEGER): Số người đang ở hiện tại
- `monthly_rent` (DECIMAL): Giá thuê hàng tháng
- `area` (DECIMAL, optional): Diện tích phòng (m²)
- `description` (TEXT, optional): Mô tả phòng
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một phòng thuộc về một nhà trọ (`property_id` → `properties.id`)
- Một phòng có nhiều người thuê (`tenants.room_id` → `rooms.id`)
- Một phòng có nhiều hợp đồng (`contracts.room_id` → `rooms.id`)
- Một phòng có nhiều đồng hồ (`meters.room_id` → `rooms.id`)
- Một phòng có nhiều hóa đơn (`bills.room_id` → `rooms.id`)

**Ý nghĩa:**
- `status` tự động cập nhật dựa trên số lượng người thuê đang ở
- `current_occupants` được cập nhật khi có người thuê vào/ra
- Sử dụng soft delete để giữ lại lịch sử

---

### 3. BẢNG `tenants` (Người thuê)

**Mục đích:** Lưu trữ thông tin người thuê nhà.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất của người thuê
- `fullname` (VARCHAR): Họ và tên đầy đủ
- `phone` (VARCHAR): Số điện thoại
- `email` (VARCHAR, optional): Email
- `birthdate` (DATE, optional): Ngày sinh
- `gender` (VARCHAR, optional): Giới tính
- `hometown` (VARCHAR, optional): Quê quán
- `occupation` (VARCHAR, optional): Nghề nghiệp
- `id_number` (VARCHAR, optional): CMND/CCCD
- `room_id` (UUID, FOREIGN KEY → `rooms.id`, optional): ID phòng đang ở
- `user_id` (UUID, FOREIGN KEY → `users.userid`, optional): ID tài khoản người dùng (khi đã đăng ký)
- `active_in_room` (BOOLEAN): Trạng thái đang ở trong phòng (true = đang ở, false = đã chuyển đi)
- `is_active` (BOOLEAN): Trạng thái hoạt động (dùng cho soft delete)
- `account_status` (ENUM): Trạng thái tài khoản (PENDING, ACTIVE, INACTIVE)
- `note` (TEXT, optional): Ghi chú
- `created_by` (UUID, FOREIGN KEY → `users.userid`): ID người tạo
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một người thuê có thể ở một phòng (`room_id` → `rooms.id`)
- Một người thuê có một tài khoản người dùng (`user_id` → `users.userid`)
- Một người thuê có nhiều hợp đồng (`contracts.tenant_id` → `tenants.id`)
- Một người thuê có nhiều liên hệ khẩn cấp (`tenant_emergency_contacts.tenant_id` → `tenants.id`)
- Một người thuê có nhiều lời mời (`tenant_invitations.tenant_id` → `tenants.id`)

**Ý nghĩa:**
- `active_in_room` được tự động cập nhật bởi trigger dựa trên `room_id`
- `is_active` dùng cho soft delete, khác với `active_in_room`
- `account_status` theo dõi trạng thái tài khoản của người thuê trên mobile app
- `user_id` liên kết với bảng `users` khi người thuê đã đăng ký tài khoản

---

### 4. BẢNG `tenant_emergency_contacts` (Liên hệ khẩn cấp)

**Mục đích:** Lưu trữ thông tin liên hệ khẩn cấp của người thuê.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `tenant_id` (UUID, FOREIGN KEY → `tenants.id`): ID người thuê
- `contact_name` (VARCHAR): Tên người liên hệ
- `phone` (VARCHAR): Số điện thoại
- `relationship` (VARCHAR, optional): Mối quan hệ (ví dụ: Cha, Mẹ, Anh/Chị)
- `email` (VARCHAR, optional): Email
- `address` (VARCHAR, optional): Địa chỉ
- `is_primary` (BOOLEAN): Liên hệ chính (true = liên hệ chính)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một liên hệ khẩn cấp thuộc về một người thuê (`tenant_id` → `tenants.id`)

**Ý nghĩa:**
- Mỗi người thuê có thể có nhiều liên hệ khẩn cấp
- `is_primary` đánh dấu liên hệ chính (thường chỉ có một)

---

### 5. BẢNG `contracts` (Hợp đồng)

**Mục đích:** Lưu trữ thông tin hợp đồng thuê nhà giữa chủ nhà và người thuê.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất của hợp đồng
- `contract_number` (VARCHAR, UNIQUE): Số hợp đồng (duy nhất)
- `room_id` (UUID, FOREIGN KEY → `rooms.id`): ID phòng được thuê
- `tenant_id` (UUID, FOREIGN KEY → `tenants.id`): ID người thuê
- `landlord_id` (UUID, FOREIGN KEY → `users.userid`): ID chủ nhà
- `start_date` (DATE): Ngày bắt đầu hợp đồng
- `end_date` (DATE): Ngày kết thúc hợp đồng (theo hợp đồng)
- `terminated_date` (DATE, optional): Ngày chấm dứt thực tế
- `monthly_rent` (DECIMAL): Giá thuê hàng tháng
- `deposit` (DECIMAL, optional): Tiền cọc
- `payment_cycle` (ENUM): Chu kỳ thanh toán (MONTHLY, QUARTERLY, YEARLY)
- `payment_day` (INTEGER): Ngày thanh toán trong tháng (1-31)
- `status` (ENUM): Trạng thái hợp đồng (DRAFT, ACTIVE, EXPIRED, TERMINATED)
- `termination_reason` (ENUM, optional): Lý do chấm dứt (EXPIRED, VIOLATION, TENANT_REQUEST, LANDLORD_REQUEST, OTHER)
- `termination_note` (TEXT, optional): Ghi chú về việc chấm dứt
- `is_early_termination` (BOOLEAN): Có phải chấm dứt sớm không
- `terms` (TEXT, optional): Điều khoản hợp đồng
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một hợp đồng thuộc về một phòng (`room_id` → `rooms.id`)
- Một hợp đồng thuộc về một người thuê (`tenant_id` → `tenants.id`)
- Một hợp đồng thuộc về một chủ nhà (`landlord_id` → `users.userid`)
- Một hợp đồng có nhiều hóa đơn (`bills.contract_id` → `contracts.id`)
- Một hợp đồng có nhiều file (`contract_files.contract_id` → `contracts.id`)

**Ý nghĩa:**
- `status` được tự động cập nhật bởi trigger dựa trên `termination_reason` và ngày tháng
- `terminated_date` khác với `end_date`: `end_date` là ngày kết thúc theo hợp đồng, `terminated_date` là ngày chấm dứt thực tế
- `is_early_termination` = true khi `terminated_date` < `end_date`
- Sử dụng soft delete để giữ lại lịch sử

---

### 6. BẢNG `contract_files` (File hợp đồng)

**Mục đích:** Lưu trữ các file đính kèm của hợp đồng (PDF, hình ảnh).

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `contract_id` (UUID, FOREIGN KEY → `contracts.id`): ID hợp đồng
- `file_name` (VARCHAR): Tên file
- `file_path` (VARCHAR): Đường dẫn file trong storage
- `file_type` (VARCHAR): Loại file (PDF, IMAGE, etc.)
- `file_size` (INTEGER): Kích thước file (bytes)
- `created_at` (TIMESTAMP): Thời gian tạo

**Quan hệ:**
- Một file thuộc về một hợp đồng (`contract_id` → `contracts.id`)

**Ý nghĩa:**
- File được lưu trữ trong Supabase Storage bucket "contracts"
- Hỗ trợ nhiều loại file cho mỗi hợp đồng

---

### 7. BẢNG `bills` (Hóa đơn)

**Mục đích:** Lưu trữ thông tin các hóa đơn thanh toán.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất của hóa đơn
- `bill_number` (VARCHAR, UNIQUE): Số hóa đơn (duy nhất, tự động tạo)
- `contract_id` (UUID, FOREIGN KEY → `contracts.id`): ID hợp đồng
- `room_id` (UUID, FOREIGN KEY → `rooms.id`): ID phòng
- `tenant_id` (UUID, FOREIGN KEY → `tenants.id`): ID người thuê
- `name` (VARCHAR): Tên hóa đơn (ví dụ: "Hóa đơn tiền thuê tháng 1/2025")
- `bill_type` (ENUM): Loại hóa đơn (RENT, SERVICE, OTHER)
- `period_start` (DATE): Ngày bắt đầu kỳ tính tiền
- `period_end` (DATE): Ngày kết thúc kỳ tính tiền
- `due_date` (DATE): Ngày hết hạn thanh toán
- `total_amount` (DECIMAL): Tổng số tiền
- `late_fee` (DECIMAL, default: 0): Phí trễ hạn
- `discount_amount` (DECIMAL, default: 0): Số tiền giảm giá
- `status` (ENUM): Trạng thái (UNPAID, PAID, OVERDUE, PROCESSING, PARTIALLY_PAID, CANCELLED)
- `notes` (TEXT, optional): Ghi chú
- `generated_by` (UUID, FOREIGN KEY → `users.userid`): ID người tạo hóa đơn
- `generated_at` (TIMESTAMP): Thời gian tạo hóa đơn
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một hóa đơn thuộc về một hợp đồng (`contract_id` → `contracts.id`)
- Một hóa đơn thuộc về một phòng (`room_id` → `rooms.id`)
- Một hóa đơn thuộc về một người thuê (`tenant_id` → `tenants.id`)
- Một hóa đơn có nhiều mục (`bill_items.bill_id` → `bills.id`)
- Một hóa đơn có nhiều thanh toán (`payments.bill_id` → `bills.id`)

**Ý nghĩa:**
- `bill_number` được tự động tạo theo format: BILL-XXXXXX
- `status` có thể được tự động cập nhật thành OVERDUE bởi function `check_and_update_overdue_bills`
- `total_amount` = tổng của các `bill_items.amount` + `late_fee` - `discount_amount`
- Sử dụng soft delete để giữ lại lịch sử

---

### 8. BẢNG `bill_items` (Chi tiết hóa đơn)

**Mục đích:** Lưu trữ các mục chi tiết trong hóa đơn (tiền thuê, điện, nước, wifi, etc.).

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `bill_id` (UUID, FOREIGN KEY → `bills.id`): ID hóa đơn
- `service_id` (UUID, FOREIGN KEY → `services.id`, optional): ID dịch vụ (nếu có)
- `description` (VARCHAR): Mô tả mục (ví dụ: "Tiền thuê phòng", "Tiền điện tháng 1")
- `quantity` (DECIMAL): Số lượng
- `unit_price` (DECIMAL): Đơn giá
- `amount` (DECIMAL, GENERATED): Tổng tiền = quantity × unit_price (tự động tính)

**Quan hệ:**
- Một mục thuộc về một hóa đơn (`bill_id` → `bills.id`)
- Một mục có thể liên kết với một dịch vụ (`service_id` → `services.id`)

**Ý nghĩa:**
- `amount` là generated column, tự động tính từ `quantity × unit_price`
- Mỗi hóa đơn có thể có nhiều mục (tiền thuê, điện, nước, wifi, etc.)
- `service_id` có thể NULL nếu là mục không liên quan đến dịch vụ (ví dụ: tiền thuê)

---

### 9. BẢNG `services` (Dịch vụ)

**Mục đích:** Lưu trữ thông tin các dịch vụ (điện, nước, wifi, gửi xe, etc.).

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `property_id` (UUID, FOREIGN KEY → `properties.id`): ID nhà trọ
- `name` (VARCHAR): Tên dịch vụ (ví dụ: "Điện", "Nước", "Wifi")
- `service_type` (ENUM): Loại dịch vụ (ELECTRIC, WATER, WIFI, PARKING, OTHER)
- `unit` (VARCHAR): Đơn vị tính (kWh, m³, tháng, etc.)
- `price_per_unit` (DECIMAL): Giá mỗi đơn vị
- `is_metered` (BOOLEAN): Có sử dụng đồng hồ đo không (true = có đồng hồ)
- `pricing_note` (TEXT, optional): Ghi chú về cách tính giá
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một dịch vụ thuộc về một nhà trọ (`property_id` → `properties.id`)
- Một dịch vụ có nhiều đồng hồ (`meters.service_id` → `services.id`)
- Một dịch vụ có thể xuất hiện trong nhiều mục hóa đơn (`bill_items.service_id` → `services.id`)

**Ý nghĩa:**
- `is_metered` = true: dịch vụ có đồng hồ đo (điện, nước) → cần đọc chỉ số
- `is_metered` = false: dịch vụ cố định (wifi, gửi xe) → giá cố định
- Mỗi nhà trọ có thể có nhiều dịch vụ khác nhau

---

### 10. BẢNG `meters` (Đồng hồ)

**Mục đích:** Lưu trữ thông tin các đồng hồ đo (điện, nước) của từng phòng.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `room_id` (UUID, FOREIGN KEY → `rooms.id`): ID phòng
- `service_id` (UUID, FOREIGN KEY → `services.id`): ID dịch vụ (điện hoặc nước)
- `meter_code` (VARCHAR): Mã đồng hồ
- `last_read` (DECIMAL, optional): Chỉ số đọc cuối cùng
- `last_read_date` (DATE, optional): Ngày đọc chỉ số cuối cùng
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một đồng hồ thuộc về một phòng (`room_id` → `rooms.id`)
- Một đồng hồ thuộc về một dịch vụ (`service_id` → `services.id`)

**Ý nghĩa:**
- Mỗi phòng có thể có nhiều đồng hồ (điện, nước)
- `last_read` và `last_read_date` được cập nhật khi đọc chỉ số mới
- Chỉ số được sử dụng để tính tiền trong hóa đơn

---

### 11. BẢNG `payments` (Thanh toán)

**Mục đích:** Lưu trữ thông tin các giao dịch thanh toán.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `bill_id` (UUID, FOREIGN KEY → `bills.id`): ID hóa đơn được thanh toán
- `amount` (DECIMAL): Số tiền thanh toán
- `payment_date` (DATE): Ngày thanh toán
- `method` (ENUM): Phương thức thanh toán (CASH, BANK_TRANSFER, CARD, OTHER)
- `reference` (VARCHAR, optional): Mã tham chiếu (số giao dịch, số thẻ, etc.)
- `note` (TEXT, optional): Ghi chú
- `payment_status` (ENUM): Trạng thái thanh toán (PENDING, COMPLETED, FAILED, REFUNDED)
- `receiving_account_id` (UUID, FOREIGN KEY → `payment_accounts.id`, optional): ID tài khoản nhận tiền
- `processed_by` (UUID, FOREIGN KEY → `users.userid`): ID người xử lý thanh toán
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một thanh toán thuộc về một hóa đơn (`bill_id` → `bills.id`)
- Một thanh toán được xử lý bởi một người dùng (`processed_by` → `users.userid`)
- Một thanh toán có thể gửi vào một tài khoản (`receiving_account_id` → `payment_accounts.id`)

**Ý nghĩa:**
- Một hóa đơn có thể có nhiều thanh toán (thanh toán nhiều lần)
- Khi tổng số tiền thanh toán >= `bills.total_amount`, hóa đơn được tự động cập nhật thành PAID
- `payment_status` theo dõi trạng thái của giao dịch thanh toán

---

### 12. BẢNG `payment_accounts` (Tài khoản thanh toán)

**Mục đích:** Lưu trữ thông tin tài khoản ngân hàng của chủ nhà để nhận thanh toán.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `user_id` (UUID, FOREIGN KEY → `users.userid`): ID chủ nhà
- `bank_code` (VARCHAR): Mã ngân hàng
- `bank_name` (VARCHAR): Tên ngân hàng
- `acq_id` (VARCHAR, optional): Mã ngân hàng (acquirer ID)
- `account_number` (VARCHAR): Số tài khoản
- `account_holder` (VARCHAR): Tên chủ tài khoản
- `branch` (VARCHAR, optional): Chi nhánh
- `is_default` (BOOLEAN): Tài khoản mặc định (chỉ một tài khoản mặc định cho mỗi user)
- `is_active` (BOOLEAN): Trạng thái hoạt động
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một tài khoản thuộc về một chủ nhà (`user_id` → `users.userid`)
- Một tài khoản có thể nhận nhiều thanh toán (`payments.receiving_account_id` → `payment_accounts.id`)

**Ý nghĩa:**
- Mỗi chủ nhà có thể có nhiều tài khoản ngân hàng
- `is_default` = true: tài khoản mặc định (chỉ một tài khoản mặc định cho mỗi user, được đảm bảo bởi trigger)
- Sử dụng soft delete để giữ lại lịch sử

---

### 13. BẢNG `maintenance` (Bảo trì)

**Mục đích:** Lưu trữ thông tin các yêu cầu và công việc bảo trì.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `property_id` (UUID, FOREIGN KEY → `properties.id`): ID nhà trọ
- `room_id` (UUID, FOREIGN KEY → `rooms.id`, optional): ID phòng (NULL nếu bảo trì tòa nhà)
- `user_report_id` (UUID, FOREIGN KEY → `users.userid`): ID người báo cáo
- `maintenance_request_id` (UUID, FOREIGN KEY → `maintenance_requests.id`, optional): ID yêu cầu bảo trì (nếu có)
- `title` (VARCHAR): Tiêu đề yêu cầu bảo trì
- `description` (TEXT): Mô tả chi tiết
- `url_image` (TEXT, optional): URL hình ảnh (JSON array)
- `maintenance_type` (ENUM): Loại bảo trì (BUILDING, ROOM, OTHER)
- `priority` (ENUM): Mức độ ưu tiên (LOW, MEDIUM, HIGH, URGENT)
- `status` (ENUM): Trạng thái (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `cost` (DECIMAL, optional): Chi phí bảo trì
- `completed_at` (TIMESTAMP, optional): Thời gian hoàn thành
- `deleted_at` (TIMESTAMP): Thời gian xóa (soft delete)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một bảo trì thuộc về một nhà trọ (`property_id` → `properties.id`)
- Một bảo trì có thể thuộc về một phòng (`room_id` → `rooms.id`, NULL nếu bảo trì tòa nhà)
- Một bảo trì được báo cáo bởi một người dùng (`user_report_id` → `users.userid`)
- Một bảo trì có thể liên kết với một yêu cầu (`maintenance_request_id` → `maintenance_requests.id`)

**Ý nghĩa:**
- `maintenance_type` = ROOM: bảo trì phòng cụ thể → `room_id` bắt buộc
- `maintenance_type` = BUILDING hoặc OTHER: bảo trì tòa nhà → `room_id` = NULL
- `status` = COMPLETED yêu cầu `cost` > 0
- `url_image` lưu trữ nhiều hình ảnh dưới dạng JSON array

---

### 14. BẢNG `maintenance_requests` (Yêu cầu bảo trì)

**Mục đích:** Lưu trữ các yêu cầu bảo trì từ người thuê (chờ phê duyệt).

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `properties_id` (UUID, FOREIGN KEY → `properties.id`): ID nhà trọ
- `room_id` (UUID, FOREIGN KEY → `rooms.id`, optional): ID phòng
- `reported_by` (UUID, FOREIGN KEY → `users.userid`): ID người báo cáo (người thuê)
- `description` (TEXT): Mô tả yêu cầu
- `url_report` (TEXT, optional): URL hình ảnh báo cáo (JSON array)
- `maintenance_requests_status` (ENUM): Trạng thái (PENDING, APPROVED, REJECTED, CANCELLED)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một yêu cầu thuộc về một nhà trọ (`properties_id` → `properties.id`)
- Một yêu cầu có thể thuộc về một phòng (`room_id` → `rooms.id`)
- Một yêu cầu được báo cáo bởi một người dùng (`reported_by` → `users.userid`)
- Một yêu cầu có thể được chuyển thành một bảo trì (`maintenance.maintenance_request_id` → `maintenance_requests.id`)

**Ý nghĩa:**
- Yêu cầu bảo trì từ người thuê cần được chủ nhà phê duyệt
- Khi APPROVED, yêu cầu được chuyển thành bản ghi `maintenance`
- `maintenance_requests_status` khác với `maintenance.status`

---

### 15. BẢNG `chat_rooms` (Phòng chat)

**Mục đích:** Lưu trữ thông tin các phòng chat giữa chủ nhà và người thuê.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `name` (VARCHAR): Tên phòng chat
- `type` (ENUM): Loại phòng (TENANT_CHAT, GROUP_CHAT)
- `property_id` (UUID, FOREIGN KEY → `properties.id`, optional): ID nhà trọ
- `room_id` (UUID, FOREIGN KEY → `rooms.id`, optional): ID phòng
- `contract_id` (UUID, FOREIGN KEY → `contracts.id`, optional): ID hợp đồng
- `room_code` (VARCHAR, optional): Mã phòng (để hiển thị)
- `is_active` (BOOLEAN): Trạng thái hoạt động
- `is_activated` (BOOLEAN): Đã được kích hoạt chưa (khi tenant accept invitation)
- `created_by` (UUID, FOREIGN KEY → `users.userid`): ID người tạo
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật (cập nhật khi có tin nhắn mới)

**Quan hệ:**
- Một phòng chat có thể thuộc về một nhà trọ (`property_id` → `properties.id`)
- Một phòng chat có thể thuộc về một phòng (`room_id` → `rooms.id`)
- Một phòng chat có thể thuộc về một hợp đồng (`contract_id` → `contracts.id`)
- Một phòng chat có nhiều người tham gia (`chat_participants.room_id` → `chat_rooms.id`)
- Một phòng chat có nhiều tin nhắn (`chat_messages.room_id` → `chat_rooms.id`)

**Ý nghĩa:**
- `type` = TENANT_CHAT: chat 1-1 giữa chủ nhà và người thuê
- `is_activated` = true khi người thuê đã accept invitation và tham gia chat
- `updated_at` được cập nhật mỗi khi có tin nhắn mới để sắp xếp danh sách chat

---

### 16. BẢNG `chat_participants` (Người tham gia chat)

**Mục đích:** Lưu trữ thông tin người tham gia trong mỗi phòng chat.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `room_id` (UUID, FOREIGN KEY → `chat_rooms.id`): ID phòng chat
- `user_id` (UUID, FOREIGN KEY → `users.userid`): ID người dùng
- `user_type` (ENUM): Loại người dùng (ADMIN, TENANT)
- `last_read_at` (TIMESTAMP, optional): Thời gian đọc tin nhắn cuối cùng
- `is_active` (BOOLEAN): Trạng thái tham gia (true = đang tham gia)

**Quan hệ:**
- Một người tham gia thuộc về một phòng chat (`room_id` → `chat_rooms.id`)
- Một người tham gia là một người dùng (`user_id` → `users.userid`)

**Ý nghĩa:**
- Mỗi phòng chat có nhiều người tham gia (thường là 2: chủ nhà và người thuê)
- `last_read_at` dùng để tính số tin nhắn chưa đọc
- `user_type` phân biệt chủ nhà (ADMIN) và người thuê (TENANT)

---

### 17. BẢNG `chat_messages` (Tin nhắn)

**Mục đích:** Lưu trữ các tin nhắn trong phòng chat.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `room_id` (UUID, FOREIGN KEY → `chat_rooms.id`): ID phòng chat
- `sender_id` (UUID, FOREIGN KEY → `users.userid`): ID người gửi
- `sender_type` (ENUM): Loại người gửi (ADMIN, TENANT)
- `content` (TEXT): Nội dung tin nhắn
- `message_type` (ENUM): Loại tin nhắn (TEXT, IMAGE, FILE, SYSTEM)
- `file_url` (VARCHAR, optional): URL file (nếu là file hoặc hình ảnh)
- `file_name` (VARCHAR, optional): Tên file
- `file_size` (INTEGER, optional): Kích thước file (bytes)
- `reply_to` (UUID, FOREIGN KEY → `chat_messages.id`, optional): ID tin nhắn được trả lời
- `is_deleted` (BOOLEAN): Đã xóa chưa (soft delete)
- `created_at` (TIMESTAMP): Thời gian gửi

**Quan hệ:**
- Một tin nhắn thuộc về một phòng chat (`room_id` → `chat_rooms.id`)
- Một tin nhắn được gửi bởi một người dùng (`sender_id` → `users.userid`)
- Một tin nhắn có thể trả lời một tin nhắn khác (`reply_to` → `chat_messages.id`)
- Một tin nhắn có nhiều reaction (`message_reactions.message_id` → `chat_messages.id`)

**Ý nghĩa:**
- `message_type` = TEXT: tin nhắn văn bản
- `message_type` = IMAGE: tin nhắn hình ảnh
- `message_type` = FILE: tin nhắn file đính kèm
- `message_type` = SYSTEM: tin nhắn hệ thống (ví dụ: "Người dùng đã tham gia")
- `reply_to` cho phép trả lời tin nhắn cụ thể
- Sử dụng soft delete (`is_deleted`) để giữ lại lịch sử

---

### 18. BẢNG `message_reactions` (Reaction tin nhắn)

**Mục đích:** Lưu trữ các reaction (cảm xúc) trên tin nhắn.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `message_id` (UUID, FOREIGN KEY → `chat_messages.id`): ID tin nhắn
- `user_id` (UUID, FOREIGN KEY → `users.userid`): ID người reaction
- `reaction` (VARCHAR): Loại reaction (👍, ❤️, 😂, etc.)
- `created_at` (TIMESTAMP): Thời gian reaction

**Quan hệ:**
- Một reaction thuộc về một tin nhắn (`message_id` → `chat_messages.id`)
- Một reaction được tạo bởi một người dùng (`user_id` → `users.userid`)

**Ý nghĩa:**
- Mỗi người dùng có thể reaction nhiều tin nhắn
- Mỗi tin nhắn có thể có nhiều reaction từ nhiều người dùng

---

### 19. BẢNG `chat_notifications` (Thông báo chat)

**Mục đích:** Lưu trữ thông báo về tin nhắn mới cho người tham gia.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `user_id` (UUID, FOREIGN KEY → `users.userid`): ID người nhận thông báo
- `room_id` (UUID, FOREIGN KEY → `chat_rooms.id`): ID phòng chat
- `message_id` (UUID, FOREIGN KEY → `chat_messages.id`): ID tin nhắn
- `type` (VARCHAR): Loại thông báo (NEW_MESSAGE)
- `is_read` (BOOLEAN): Đã đọc chưa
- `created_at` (TIMESTAMP): Thời gian tạo

**Quan hệ:**
- Một thông báo thuộc về một người dùng (`user_id` → `users.userid`)
- Một thông báo thuộc về một phòng chat (`room_id` → `chat_rooms.id`)
- Một thông báo thuộc về một tin nhắn (`message_id` → `chat_messages.id`)

**Ý nghĩa:**
- Thông báo được tạo tự động khi có tin nhắn mới
- `is_read` = true khi người dùng đã đọc tin nhắn

---

### 20. BẢNG `tenant_invitations` (Lời mời người thuê)

**Mục đích:** Lưu trữ các lời mời gửi cho người thuê để tham gia hệ thống.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `tenant_id` (UUID, FOREIGN KEY → `tenants.id`): ID người thuê
- `email` (VARCHAR): Email gửi lời mời
- `invitation_token` (VARCHAR, UNIQUE): Token duy nhất để xác nhận lời mời
- `status` (ENUM): Trạng thái (PENDING, ACCEPTED, EXPIRED, CANCELLED)
- `expires_at` (TIMESTAMP): Thời gian hết hạn (thường là 7 ngày)
- `notes` (TEXT, optional): Ghi chú
- `created_by` (UUID, FOREIGN KEY → `users.userid`): ID người tạo lời mời
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một lời mời thuộc về một người thuê (`tenant_id` → `tenants.id`)
- Một lời mời được tạo bởi một người dùng (`created_by` → `users.userid`)

**Ý nghĩa:**
- `invitation_token` được sử dụng trong URL để người thuê accept invitation
- `expires_at` thường là 7 ngày sau khi tạo
- Khi ACCEPTED, `tenant.user_id` được cập nhật và `tenant.account_status` = ACTIVE

---

### 21. BẢNG `users` (Người dùng)

**Mục đích:** Lưu trữ thông tin người dùng (chủ nhà và người thuê).

**Các trường:**
- `userid` (UUID, PRIMARY KEY): Định danh duy nhất (đồng bộ với `auth.users.id`)
- `email` (VARCHAR, UNIQUE): Email
- `full_name` (VARCHAR): Họ và tên đầy đủ
- `avatar_url` (VARCHAR, optional): URL avatar
- `role` (ENUM): Vai trò (ADMIN, TENANT)
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Quan hệ:**
- Một người dùng có thể sở hữu nhiều nhà trọ (`properties.owner_id` → `users.userid`)
- Một người dùng có thể là người thuê (`tenants.user_id` → `users.userid`)
- Một người dùng có thể có nhiều hợp đồng (`contracts.landlord_id` → `users.userid`)
- Một người dùng có thể có nhiều tài khoản thanh toán (`payment_accounts.user_id` → `users.userid`)
- Một người dùng có thể tham gia nhiều phòng chat (`chat_participants.user_id` → `users.userid`)
- Một người dùng có thể gửi nhiều tin nhắn (`chat_messages.sender_id` → `users.userid`)

**Ý nghĩa:**
- Bảng này đồng bộ với `auth.users` của Supabase Auth
- `role` = ADMIN: chủ nhà
- `role` = TENANT: người thuê
- `userid` = `auth.users.id`

---

### 22. BẢNG `activity_logs` (Nhật ký hoạt động)

**Mục đích:** Lưu trữ lịch sử các hoạt động trong hệ thống.

**Các trường:**
- `id` (UUID, PRIMARY KEY): Định danh duy nhất
- `user_id` (UUID, FOREIGN KEY → `users.userid`): ID người thực hiện
- `action` (VARCHAR): Hành động (ví dụ: "CREATE_BILL", "UPDATE_CONTRACT")
- `entity_type` (VARCHAR): Loại entity (BILL, CONTRACT, TENANT, etc.)
- `entity_id` (UUID): ID của entity
- `description` (TEXT, optional): Mô tả chi tiết
- `metadata` (JSONB, optional): Dữ liệu bổ sung (JSON)
- `created_at` (TIMESTAMP): Thời gian thực hiện

**Quan hệ:**
- Một log thuộc về một người dùng (`user_id` → `users.userid`)

**Ý nghĩa:**
- Ghi lại tất cả các hoạt động quan trọng trong hệ thống
- `metadata` lưu trữ thông tin bổ sung dưới dạng JSON
- Hữu ích cho audit trail và debugging

---

### 23. VIEW `financial_summary` (Tóm tắt tài chính)

**Mục đích:** View tổng hợp thông tin tài chính (doanh thu, chi phí, lợi nhuận).

**Các trường:** (Tùy thuộc vào cách view được định nghĩa)
- Các trường tổng hợp từ `bills`, `payments`, `maintenance`

**Ý nghĩa:**
- View được sử dụng để báo cáo tài chính
- Tự động tính toán từ các bảng liên quan

---

### 24. VIEW `occupancy_summary` (Tóm tắt tình trạng phòng)

**Mục đích:** View tổng hợp thông tin về tình trạng phòng (số phòng trống, đã thuê, tỷ lệ lấp đầy).

**Các trường:** (Tùy thuộc vào cách view được định nghĩa)
- Các trường tổng hợp từ `rooms`, `contracts`, `tenants`

**Ý nghĩa:**
- View được sử dụng để báo cáo tình trạng phòng
- Tự động tính toán từ các bảng liên quan

---

### 25. VIEW `maintenance_summary` (Tóm tắt bảo trì)

**Mục đích:** View tổng hợp thông tin về bảo trì (số lượng, chi phí, trạng thái).

**Các trường:** (Tùy thuộc vào cách view được định nghĩa)
- Các trường tổng hợp từ `maintenance`, `maintenance_requests`

**Ý nghĩa:**
- View được sử dụng để báo cáo bảo trì
- Tự động tính toán từ các bảng liên quan

---

## CÁC HÀM (FUNCTIONS)

### 1. `check_and_update_overdue_bills()`

**Mục đích:** Kiểm tra và cập nhật các hóa đơn quá hạn.

**Tham số:** Không có

**Chức năng:**
- Tìm tất cả hóa đơn có `status` = UNPAID và `due_date` < ngày hiện tại
- Cập nhật `status` = OVERDUE cho các hóa đơn này
- Trả về số lượng hóa đơn đã cập nhật và danh sách ID

**Sử dụng:**
- Được gọi định kỳ (cron job) hoặc thủ công
- Đảm bảo các hóa đơn quá hạn được đánh dấu đúng

---

### 2. `can_delete_room(room_id UUID)`

**Mục đích:** Kiểm tra xem có thể xóa phòng không.

**Tham số:**
- `room_id` (UUID): ID phòng cần kiểm tra

**Chức năng:**
- Kiểm tra phòng có người thuê đang ở không (`active_in_room` = true)
- Kiểm tra phòng có hợp đồng đang hoạt động không
- Kiểm tra phòng có hóa đơn chưa thanh toán không
- Trả về `{canDelete: boolean, reason: string, details: object}`

**Sử dụng:**
- Được gọi trước khi xóa phòng để đảm bảo tính toàn vẹn dữ liệu

---

### 3. `soft_delete_room(p_room_id UUID)`

**Mục đích:** Xóa mềm (soft delete) phòng.

**Tham số:**
- `p_room_id` (UUID): ID phòng cần xóa

**Chức năng:**
- Set `deleted_at` = thời gian hiện tại
- Đảm bảo tính nhất quán dữ liệu (bypass RLS nếu cần)

**Sử dụng:**
- Được gọi khi xóa phòng (sau khi đã kiểm tra bằng `can_delete_room`)

---

### 4. `can_delete_property(property_id UUID)`

**Mục đích:** Kiểm tra xem có thể xóa nhà trọ không.

**Tham số:**
- `property_id` (UUID): ID nhà trọ cần kiểm tra

**Chức năng:**
- Kiểm tra nhà trọ có phòng nào không
- Kiểm tra nhà trọ có hợp đồng đang hoạt động không
- Kiểm tra nhà trọ có hóa đơn chưa thanh toán không
- Trả về `{canDelete: boolean, reason: string, details: object}`

**Sử dụng:**
- Được gọi trước khi xóa nhà trọ để đảm bảo tính toàn vẹn dữ liệu

---

### 5. `soft_delete_property(p_property_id UUID)`

**Mục đích:** Xóa mềm (soft delete) nhà trọ.

**Tham số:**
- `p_property_id` (UUID): ID nhà trọ cần xóa

**Chức năng:**
- Set `deleted_at` = thời gian hiện tại
- Đảm bảo tính nhất quán dữ liệu (bypass RLS nếu cần)

**Sử dụng:**
- Được gọi khi xóa nhà trọ (sau khi đã kiểm tra bằng `can_delete_property`)

---

### 6. `update_tenant_room_on_contract_termination(p_contract_id UUID)`

**Mục đích:** Cập nhật thông tin người thuê và phòng khi hợp đồng kết thúc.

**Tham số:**
- `p_contract_id` (UUID): ID hợp đồng đã kết thúc

**Chức năng:**
- Set `tenant.active_in_room` = false
- Set `tenant.room_id` = NULL
- Cập nhật `room.status` = VACANT nếu không còn người thuê
- Cập nhật `room.current_occupants` = 0 nếu không còn người thuê

**Sử dụng:**
- Được gọi tự động khi hợp đồng được terminate
- Đảm bảo dữ liệu người thuê và phòng được cập nhật đúng

---

### 7. `accept_tenant_invitation(p_invitation_token VARCHAR)`

**Mục đích:** Xác nhận lời mời người thuê.

**Tham số:**
- `p_invitation_token` (VARCHAR): Token lời mời

**Chức năng:**
- Kiểm tra token có hợp lệ và chưa hết hạn không
- Kiểm tra email có khớp với tenant không
- Cập nhật `tenant.user_id` = user_id từ email
- Cập nhật `tenant.account_status` = ACTIVE
- Cập nhật `tenant_invitations.status` = ACCEPTED
- Trả về `{success: boolean, message: string, tenant: object}`

**Sử dụng:**
- Được gọi khi người thuê click vào link invitation và xác nhận

---

## CÁC TRIGGER

### 1. Trigger cập nhật `active_in_room` của `tenants`

**Bảng:** `tenants`

**Sự kiện:** INSERT, UPDATE

**Chức năng:**
- Khi `room_id` được set (không NULL) → `active_in_room` = true
- Khi `room_id` được set thành NULL → `active_in_room` = false
- Đảm bảo `active_in_room` luôn đồng bộ với `room_id`

---

### 2. Trigger cập nhật `status` của `contracts`

**Bảng:** `contracts`

**Sự kiện:** UPDATE

**Chức năng:**
- Khi `termination_reason` = EXPIRED → `status` = EXPIRED
- Khi `termination_reason` = VIOLATION, TENANT_REQUEST, LANDLORD_REQUEST, OTHER → `status` = TERMINATED
- Đảm bảo `status` luôn đồng bộ với `termination_reason`

---

### 3. Trigger cập nhật `amount` của `bill_items`

**Bảng:** `bill_items`

**Sự kiện:** INSERT, UPDATE

**Chức năng:**
- Tự động tính `amount` = `quantity × unit_price`
- `amount` là generated column, không cần set thủ công

---

### 4. Trigger đảm bảo chỉ một `is_default` cho `payment_accounts`

**Bảng:** `payment_accounts`

**Sự kiện:** INSERT, UPDATE

**Chức năng:**
- Khi một tài khoản được set `is_default` = true
- Tự động set `is_default` = false cho tất cả tài khoản khác của cùng user
- Đảm bảo chỉ một tài khoản mặc định cho mỗi user

---

### 5. Trigger cập nhật `updated_at`

**Bảng:** Nhiều bảng

**Sự kiện:** UPDATE

**Chức năng:**
- Tự động cập nhật `updated_at` = thời gian hiện tại khi có bất kỳ cập nhật nào
- Áp dụng cho: `properties`, `rooms`, `tenants`, `contracts`, `bills`, `payments`, etc.

---

### 6. Trigger cập nhật `room.status` và `room.current_occupants`

**Bảng:** `tenants`

**Sự kiện:** INSERT, UPDATE, DELETE

**Chức năng:**
- Khi có người thuê vào phòng (`active_in_room` = true) → cập nhật `room.status` = OCCUPIED, tăng `current_occupants`
- Khi người thuê rời phòng (`active_in_room` = false) → giảm `current_occupants`, nếu = 0 thì `room.status` = VACANT
- Đảm bảo `room.status` và `current_occupants` luôn chính xác

---

## CÁC ENUM

### 1. `room_status` (Trạng thái phòng)
- `VACANT`: Phòng trống
- `OCCUPIED`: Phòng đã có người ở
- `MAINTENANCE`: Phòng đang bảo trì

---

### 2. `contract_status` (Trạng thái hợp đồng)
- `DRAFT`: Nháp
- `ACTIVE`: Đang hoạt động
- `EXPIRED`: Đã hết hạn
- `TERMINATED`: Đã chấm dứt

---

### 3. `termination_reason` (Lý do chấm dứt hợp đồng)
- `EXPIRED`: Hết hạn hợp đồng
- `VIOLATION`: Vi phạm điều khoản
- `TENANT_REQUEST`: Người thuê yêu cầu
- `LANDLORD_REQUEST`: Chủ nhà yêu cầu
- `OTHER`: Lý do khác

---

### 4. `bill_status` (Trạng thái hóa đơn)
- `UNPAID`: Chưa thanh toán
- `PAID`: Đã thanh toán
- `OVERDUE`: Quá hạn
- `PROCESSING`: Đang xử lý
- `PARTIALLY_PAID`: Thanh toán một phần
- `CANCELLED`: Đã hủy

---

### 5. `bill_type` (Loại hóa đơn)
- `RENT`: Tiền thuê
- `SERVICE`: Dịch vụ
- `OTHER`: Khác

---

### 6. `payment_method` (Phương thức thanh toán)
- `CASH`: Tiền mặt
- `BANK_TRANSFER`: Chuyển khoản
- `CARD`: Thẻ
- `OTHER`: Khác

---

### 7. `payment_status` (Trạng thái thanh toán)
- `PENDING`: Đang chờ
- `COMPLETED`: Hoàn thành
- `FAILED`: Thất bại
- `REFUNDED`: Đã hoàn tiền

---

### 8. `service_type` (Loại dịch vụ)
- `ELECTRIC`: Điện
- `WATER`: Nước
- `WIFI`: Internet/Wifi
- `PARKING`: Gửi xe
- `OTHER`: Khác

---

### 9. `maintenance_type` (Loại bảo trì)
- `BUILDING`: Tòa nhà
- `ROOM`: Phòng
- `OTHER`: Khác

---

### 10. `maintenance_priority` (Mức độ ưu tiên bảo trì)
- `LOW`: Thấp
- `MEDIUM`: Trung bình
- `HIGH`: Cao
- `URGENT`: Khẩn cấp

---

### 11. `maintenance_status` (Trạng thái bảo trì)
- `PENDING`: Chờ xử lý
- `IN_PROGRESS`: Đang xử lý
- `COMPLETED`: Hoàn thành
- `CANCELLED`: Đã hủy

---

### 12. `maintenance_requests_status` (Trạng thái yêu cầu bảo trì)
- `PENDING`: Chờ phê duyệt
- `APPROVED`: Đã phê duyệt
- `REJECTED`: Đã từ chối
- `CANCELLED`: Đã hủy

---

### 13. `payment_cycle` (Chu kỳ thanh toán)
- `MONTHLY`: Hàng tháng
- `QUARTERLY`: Hàng quý
- `YEARLY`: Hàng năm

---

### 14. `account_status` (Trạng thái tài khoản)
- `PENDING`: Chờ xác nhận
- `ACTIVE`: Đang hoạt động
- `INACTIVE`: Không hoạt động

---

### 15. `invitation_status` (Trạng thái lời mời)
- `PENDING`: Chờ xác nhận
- `ACCEPTED`: Đã chấp nhận
- `EXPIRED`: Đã hết hạn
- `CANCELLED`: Đã hủy

---

### 16. `user_role` (Vai trò người dùng)
- `ADMIN`: Chủ nhà/Quản trị viên
- `TENANT`: Người thuê

---

### 17. `chat_room_type` (Loại phòng chat)
- `TENANT_CHAT`: Chat 1-1 giữa chủ nhà và người thuê
- `GROUP_CHAT`: Chat nhóm

---

### 18. `user_type` (Loại người dùng trong chat)
- `ADMIN`: Chủ nhà
- `TENANT`: Người thuê

---

### 19. `message_type` (Loại tin nhắn)
- `TEXT`: Văn bản
- `IMAGE`: Hình ảnh
- `FILE`: File đính kèm
- `SYSTEM`: Tin nhắn hệ thống

---

## SƠ ĐỒ QUAN HỆ

```
users (Chủ nhà/Người thuê)
├── properties (Nhà trọ) [owner_id]
│   ├── rooms (Phòng) [property_id]
│   │   ├── tenants (Người thuê) [room_id]
│   │   │   ├── tenant_emergency_contacts [tenant_id]
│   │   │   └── tenant_invitations [tenant_id]
│   │   ├── contracts (Hợp đồng) [room_id]
│   │   │   ├── bills (Hóa đơn) [contract_id]
│   │   │   │   ├── bill_items (Chi tiết hóa đơn) [bill_id]
│   │   │   │   └── payments (Thanh toán) [bill_id]
│   │   │   └── contract_files (File hợp đồng) [contract_id]
│   │   ├── meters (Đồng hồ) [room_id]
│   │   └── bills (Hóa đơn) [room_id]
│   ├── services (Dịch vụ) [property_id]
│   │   └── meters (Đồng hồ) [service_id]
│   └── maintenance (Bảo trì) [property_id]
│       └── maintenance_requests (Yêu cầu bảo trì) [properties_id]
│
├── payment_accounts (Tài khoản thanh toán) [user_id]
│   └── payments (Thanh toán) [receiving_account_id]
│
├── chat_rooms (Phòng chat) [created_by]
│   ├── chat_participants (Người tham gia) [room_id, user_id]
│   ├── chat_messages (Tin nhắn) [room_id, sender_id]
│   │   ├── message_reactions (Reaction) [message_id]
│   │   └── chat_messages (Trả lời) [reply_to]
│   └── chat_notifications (Thông báo) [room_id, user_id]
│
└── activity_logs (Nhật ký hoạt động) [user_id]
```

---

## GHI CHÚ QUAN TRỌNG

1. **Soft Delete:** Hầu hết các bảng quan trọng sử dụng soft delete (`deleted_at`) thay vì xóa vĩnh viễn để giữ lại lịch sử dữ liệu.

2. **Generated Columns:** Một số trường được tự động tính toán (ví dụ: `bill_items.amount` = `quantity × unit_price`).

3. **RLS (Row Level Security):** Database sử dụng RLS để đảm bảo người dùng chỉ truy cập được dữ liệu của mình.

4. **Triggers:** Nhiều trigger được sử dụng để tự động cập nhật dữ liệu liên quan, đảm bảo tính nhất quán.

5. **Foreign Keys:** Tất cả các quan hệ đều được đảm bảo bằng foreign key constraints.

6. **Timestamps:** Hầu hết các bảng có `created_at` và `updated_at` để theo dõi thời gian.

---

**Ngày tạo báo cáo:** 2025-01-27  
**Phiên bản database:** Supabase PostgreSQL  
**Tác giả:** Hệ thống quản lý nhà trọ StayMatenpm 


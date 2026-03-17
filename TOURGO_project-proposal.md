# Project Proposal

## THÔNG TIN

### Nhóm

- Thành viên 1: Khuất Quốc Khánh _ 23711381
- Thành viên 2: Nguyễn Vũ Hà
- Thành viên 3: Nguyễn Tấn Khang
- Thành viên 4: Nguyễn Huỳnh Nhật Tân

### Git

Git repository: https://github.com/KhanhQuoc0203/TOURGO/edit/main/fullname_project-proposal.md

## MÔ TẢ DỰ ÁN

### Ý tưởng
Dự án xây dựng một website đặt tour du lịch trực tuyến giúp kết nối giữa người muốn đi du lịch và người tổ chức tour.
### Chi tiết
Người dùng khi đăng ký tài khoản sẽ phải chọn vai trò sử dụng hệ thống, gồm hai loại:

  Người đặt tour: tìm kiếm và đặt các tour du lịch có sẵn.

  Người tạo tour: tạo và quản lý các tour du lịch để người khác đăng ký tham gia.

Hệ thống giúp việc tìm kiếm và đặt tour trở nên nhanh chóng, đồng thời cho phép các cá nhân hoặc tổ chức dễ dàng tạo tour và quảng bá tour của mình.

Dự án này được chọn vì:

Có tính ứng dụng thực tế trong lĩnh vực du lịch

Có thể áp dụng nhiều chức năng của hệ thống web như đăng ký, đăng nhập, quản lý dữ liệu, tìm kiếm và đặt dịch vụ.

Có thể mở rộng thêm nhiều chức năng như đánh giá tour, thanh toán online, bản đồ du lịch.

Mô tả chi tiết nghiệp vụ liên quan đến project

1. Đăng ký tài khoản

Người dùng khi đăng ký phải chọn loại tài khoản:

Người đặt tour

Người tạo tour

Thông tin đăng ký gồm:

Tên người dùng

Email

Mật khẩu

Loại tài khoản

Sau khi đăng ký, người dùng có thể đăng nhập để sử dụng hệ thống.

2. Chức năng của người đặt tour

Người đặt tour có thể:

Xem danh sách các tour du lịch

Tìm kiếm tour theo địa điểm

Xem chi tiết tour

Đặt tour

Xem lịch sử các tour đã đặt

Thông tin của tour gồm:

Tên tour

Địa điểm

Thời gian

Giá tour

Lịch trình

Số lượng người tối đa

3. Chức năng của người tạo tour

Người tạo tour có thể:

Tạo tour du lịch mới

Chỉnh sửa thông tin tour

Xóa tour

Xem danh sách người đã đặt tour

Quản lý các tour đã tạo

Thông tin cần nhập khi tạo tour:

Tên tour

Địa điểm

Thời gian tour

Giá tour

Lịch trình chi tiết

Số lượng người tham gia tối đa

4. Chức năng của Admin:

Admin có thể:

	Quản lí tài khoản người dùng 
  
	Kiểm duyệt nội dung Tour (thêm/sửa/xóa)
  
	Xem danh sách Tour/ người tham gia Tour
  
	Theo dõi số lượng giao dịch, doanh thu
  
## PHÂN TÍCH & THIẾT KẾ

1. Sơ đồ các tác nhân và Chức năng (Use Case Analysis)
Hệ thống được thiết kế với 3 nhóm người dùng chính, mỗi nhóm có một không gian làm việc (Dashboard) riêng biệt:

    • Người đặt tour: Tập trung vào việc tìm kiếm, xem thông tin và thực hiện giao dịch đặt chỗ.
   
    • Người tạo tour: Tập trung vào quản lý nội dung tour và danh sách khách hàng tham gia.
   
    • Admin: Tập trung vào việc điều phối, kiểm duyệt và theo dõi các chỉ số vận hành của toàn bộ hệ thống.
   
2. Thiết kế Cơ sở dữ liệu (Database Design)

Dựa trên các thông tin cần quản lý, cấu trúc dữ liệu gồm các thực thể chính sau:

Bảng Users (Người dùng)

Lưu trữ thông tin tài khoản cho cả 3 vai trò.

    • id (Primary Key): Mã định danh.
    
    • username: Tên người dùng.
    
    • email: Email đăng ký.
    
    • password: Mật khẩu.
    
    • role: Vai trò (Customer / Provider / Admin).
    
Bảng Tours (Tour du lịch)

Lưu trữ chi tiết các gói tour do người tạo tour đăng tải.

    • id (Primary Key): Mã tour.
    
    • creator_id (Foreign Key): Liên kết với bảng Users (Người tạo).
    
    • title: Tên tour.
    
    • location: Địa điểm.
    
    • duration: Thời gian diễn ra.
    
    • price: Giá tour.
    
    • itinerary: Lịch trình chi tiết.
    
    • max_people: Số lượng người tối đa.
    
    • status: Trạng thái (Chờ duyệt, Đã duyệt, Đã đóng).
    
Bảng Bookings (Đơn đặt tour)

Quản lý lịch sử giao dịch giữa người đặt và người tạo.

    • id (Primary Key): Mã đơn hàng.
    
    • user_id (Foreign Key): Người thực hiện đặt.
    
    • tour_id (Foreign Key): Tour được đặt.
    
    • quantity: Số người đăng ký.
    
    • total_price: Tổng tiền thanh toán.
    
    • status: Trạng thái đơn (Thành công, Đang xử lí,Đã hủy).
    
3. Luồng nghiệp vụ chi tiết (Detailed Workflow)

Hệ thống vận hành dựa trên sự tương tác chặt chẽ giữa 3 vai trò thông qua các luồng xử lý sau:

A. Đối với Người đặt tour (Customer Workflow)

    1. Tìm kiếm & Lựa chọn: Người dùng truy cập trang chủ, sử dụng thanh tìm kiếm để lọc tour theo địa điểm hoặc danh mục sở thích.
    
    2. Xem chi tiết: Hệ thống hiển thị đầy đủ thông tin: tên tour, địa điểm, thời gian, giá, lịch trình chi tiết, số lượng người tối đa và đánh giá từ người dùng khác.
    
    3. Đặt tour:
    
        ◦ Người dùng nhấn "Đặt tour" và chọn số lượng người.
        
        ◦ Hệ thống kiểm tra số lượng chỗ còn trống (max_people - số người đã đặt).
        
        ◦ Nếu hợp lệ, đơn hàng được tạo với trạng thái "Đang xử lý".
        
    4. Quản lý: Truy cập "Lịch sử đặt tour" để theo dõi trạng thái đơn hàng (Đã xác nhận, Đã hủy, Hoàn thành).
    
B. Đối với Người tạo tour (Provider Workflow)

    1. Khởi tạo Tour: Nhập các thông tin: Tên, địa điểm, thời gian, giá, lịch trình chi tiết và số lượng người tối đa.
    2. Gửi duyệt & Kiểm duyệt tự động (Lớp 1):
    
        ◦ Sau khi nhấn "Tạo", hệ thống kích hoạt Bộ lọc thông minh (AI/Blacklist).
        
        ◦ Trường hợp vi phạm: Nếu chứa từ khóa cấm hoặc thông tin rác, hệ thống tự động từ chối và hiển thị lỗi yêu cầu chỉnh sửa.
        
        ◦ Trường hợp hợp lệ: Tour chuyển sang trạng thái "Chờ duyệt" (Pending) và thông báo cho Admin.
        
    3. Quản lý & Điều chỉnh: Người tạo có quyền cập nhật thông tin tour hoặc xóa tour nếu chưa có người đặt.
    
    4. Theo dõi khách hàng: Xem danh sách chi tiết (Tên, số điện thoại, số người) của những người đã đặt tour để chuẩn bị công tác tổ chức.
    
C. Đối với Admin (Administrator Workflow)

    1. Quản lý tài khoản: Theo dõi danh sách toàn bộ người dùng; thực hiện khóa/mở khóa tài khoản dựa trên mức độ uy tín.
    
    2. Cấu hình Kiểm duyệt tự động (Chức năng mới):
    
        ◦ Quản lý Blacklist: Admin cập nhật danh sách từ khóa cấm, các địa điểm nhạy cảm hoặc định dạng dữ liệu không hợp lệ để hệ thống tự động lọc.
        
        ◦ Thiết lập ngưỡng tự động: Admin có thể thiết lập để hệ thống tự động phê duyệt (Auto-approve) các tour từ các "Người tạo uy tín" (có điểm đánh giá cao) để giảm tải công việc.
        
    3. Kiểm duyệt nội dung lớp cuối (Manual Review):
    
        ◦ Admin nhận danh sách các tour đã qua bộ lọc tự động.
        
        ◦ Kiểm tra tính thực tế của hình ảnh và lịch trình.
        
        ◦ Thực hiện: "Phê duyệt" (Công khai tour) hoặc "Từ chối" (Gửi lý do cho người tạo).
        
    4. Giám sát & Báo cáo:
    
        ◦ Xem danh sách tất cả các tour đang hoạt động.
        
        ◦ Thống kê số lượng giao dịch thành công, doanh thu tổng và doanh thu theo từng nhà cung cấp.
        
        ◦ Xử lý các tour bị khách hàng "Báo cáo vi phạm".

  4. Kiến trúc Kỹ thuật
     
    • Frontend: Next.js (Xử lý giao diện và SEO).
    
    • Backend: Node.js/Express (Xử lý logic và doanh thu).
    
    • Database: PostgreSQL hoặc MongoDB (Lưu trữ quan hệ dữ liệu).

## KẾ HOẠCH

### MVP

- Mô tả các chức năng mà sản phẩm MVP của bạn sẽ thực hiện (thời hạn hoàn thành MVP 12.04.2026)
- Viết kế hoạch kiểm thử
- Liệt kê những chức năng dự trù sẽ thực hiện ở phase kế tiếp

### Beta Version
- Kết quả kiểm thử
- Viết báo cáo
- Thời hạn hoàn thành dự kiến: ... (Chậm nhất 10.05.2026)

## CÂU HỎI

```
Liệt kê các câu hỏi của bạn cho thầy ở đây:
```
- ...
- ...

---

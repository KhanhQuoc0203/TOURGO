from rest_framework import permissions

class IsAdminOrProvider(permissions.BasePermission):
    """
    Quyền: 
    - Xem (GET): Tất cả mọi người.
    - Tạo/Sửa/Xóa (POST, PUT, DELETE): Chỉ ADMIN hoặc PROVIDER.
    """
    def has_permission(self, request, view):
        # Cho phép các phương thức an toàn (GET, HEAD, OPTIONS) cho tất cả user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Nếu là các phương thức thay đổi dữ liệu (POST, PUT, DELETE...)
        # Bước 1: Kiểm tra xem đã đăng nhập chưa
        if not request.user.is_authenticated:
            return False

        # Bước 2: Kiểm tra Role (Chặn CUSTOMER)
        # Khang nhắc Tân dùng đúng chữ in hoa 'CUSTOMER' như trong model của bạn
        return request.user.role in ['ADMIN', 'PROVIDER']
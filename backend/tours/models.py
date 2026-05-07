from django.db import models
from django.conf import settings

# --- PHẦN CỦA TÂN VÀ KHANG (QUẢN LÝ TOUR) ---
class Tour(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        verbose_name="Người tạo"
    )
    address = models.CharField(max_length=255, default="Việt Nam")
    title = models.CharField(max_length=255, verbose_name="Tên Tour")
    description = models.TextField(verbose_name="Mô tả")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Giá")
    
    # TRƯỜNG QUAN TRỌNG ĐỂ LÀM LOGIC LỌC (Khang thêm dòng này)
    departure_date = models.DateField(verbose_name="Ngày khởi hành", null=True, blank=True)
    
    slots = models.IntegerField(verbose_name="Số chỗ")
    image_url = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link ảnh") # Để Hà hiển thị UI cho đẹp

    latitude = models.FloatField(verbose_name="Vĩ độ (Lat)", null=True, blank=True)
    longitude = models.FloatField(verbose_name="Kinh độ (Lng)", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Chuyến du lịch"
        verbose_name_plural = "Các chuyến du lịch"

class TourImage(models.Model):
    tour = models.ForeignKey(Tour, related_name='tour_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tour_images/', verbose_name="Ảnh")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.tour.title}"


# --- PHẦN CỦA Hà (MODEL BOOKING) 
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ thanh toán'),
        ('confirmed', 'Đã xác nhận'),
        ('cancelled', 'Đã hủy'),
    ]

    # ForeignKey kết nối User và Tour
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    
    number_of_people = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_date = models.DateField() # Ngày khách chọn đi
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.tour.title}"
    
    class Meta:
        verbose_name = "Đơn đặt tour"
        verbose_name_plural = "Các đơn đặt tour"

# --- PHẦN CỦA HÀ (MODEL TRANSACTION)       
class Transaction(models.Model):
    booking = models.OneToOneField('Booking', on_delete=models.CASCADE, related_name='transaction')
    vnp_txn_ref = models.CharField(max_length=100, unique=True) # Mã đơn hàng gửi đi
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    order_info = models.TextField()
    vnp_response_code = models.CharField(max_length=10, null=True, blank=True) # 00 là thành công
    vnp_transaction_no = models.CharField(max_length=100, null=True, blank=True) # Mã từ VNPay trả về
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction {self.vnp_txn_ref} - {self.amount}"
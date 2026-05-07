from django.urls import path
from .views import (
    TourCreateView, TourDetailAPIView, TourFilterView, 
    TourImageUploadView, BookingView, LocationListView,
    UserBookingListView, BookingDetailView,
    PaymentLinkView, VNPayIPNView # <--- NHỚ IMPORT 2 VIEW NÀY
)

urlpatterns = [
    # 1. Các API liên quan đến Booking (Đặt tour & Thanh toán)
    path('book/', BookingView.as_view(), name='tour-book'),
    path('my-bookings/', UserBookingListView.as_view(), name='user-bookings'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    
    # URL tạo link sang VNPay (Cái Hà đang thiếu)
    path('create-payment/', PaymentLinkView.as_view(), name='create-payment'),
    
    # URL để VNPay gọi về báo kết quả (IPN)
    path('vnpay-ipn/', VNPayIPNView.as_view(), name='vnpay-ipn'),

    # 2. Các API liên quan đến Tour
    path('locations/', LocationListView.as_view(), name='location-list'),
    path('filter/', TourFilterView.as_view(), name='tour-filter'),
    path('<int:pk>/', TourDetailAPIView.as_view(), name='tour-detail'),
    path('<int:tour_id>/upload-images/', TourImageUploadView.as_view(), name='tour-upload-images'),
    
    # Để dòng này dưới cùng để không bị tranh chấp URL
    path('', TourCreateView.as_view(), name='tour-create'), 
]
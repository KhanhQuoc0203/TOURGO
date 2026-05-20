from django.urls import path
from .views import (
    ProviderCustomerListView, ProviderRevenueReportView, TourCreateView, TourDetailAPIView, TourFilterView, 
    TourImageUploadView, BookingView, LocationListView, UpdateTourStatusView,
    UserBookingListView, BookingDetailView,
    VietQRCreateView,
    BookingConfirmPaymentView, AdminBookingListView, AdminApproveBookingView,
    payment_status, ReviewCreateView, UserReviewListView, UserReviewDetailView,
    ProviderTourView, ProviderTourDetailView, TourImageDeleteView
)

urlpatterns = [
    # 0. API dành cho Nhà cung cấp (Provider) - Ngày 21 & 22
    path('provider/tours/', ProviderTourView.as_view(), name='provider-tour-list-create'),
    path('provider/tours/<int:pk>/', ProviderTourDetailView.as_view(), name='provider-tour-detail'),
    path('provider/tours/images/<int:pk>/', TourImageDeleteView.as_view(), name='provider-tour-image-delete'),

    # 3. API Đánh giá - Ngày 18 (Tân)
    path('<int:tour_id>/reviews/', ReviewCreateView.as_view(), name='tour-reviews'),

    # 1. Các API liên quan đến Booking (Đặt tour & Thanh toán)
    path('book/', BookingView.as_view(), name='tour-book'),
    path('my-bookings/', UserBookingListView.as_view(), name='user-bookings'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    
    # --- THÊM ROUTE THANH TOÁN ---
    path('create-vietqr/', VietQRCreateView.as_view(), name='vietqr-create'),
    
    # --- MỚI: XÁC NHẬN & ADMIN DUYỆT ---
    path('bookings/<int:pk>/confirm-payment/', BookingConfirmPaymentView.as_view(), name='booking-confirm-payment'),
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-bookings'),
    path('admin/bookings/<int:pk>/approve/', AdminApproveBookingView.as_view(), name='admin-approve'),


    # 2. Các API liên quan đến Tour
    path('locations/', LocationListView.as_view(), name='location-list'),
    path('filter/', TourFilterView.as_view(), name='tour-filter'),
    path('<int:pk>/', TourDetailAPIView.as_view(), name='tour-detail'),
    path('<int:tour_id>/upload-images/', TourImageUploadView.as_view(), name='tour-upload-images'),
    path('bookings/<int:booking_id>/payment-status/', payment_status, name='payment-status'),
    path('reviews/me/', UserReviewListView.as_view(), name='my-reviews'),
    path('reviews/me/<int:pk>/', UserReviewDetailView.as_view(), name='my-review-detail'),
    

    # Để dòng này dưới cùng để không bị tranh chấp URL
    path('', TourCreateView.as_view(), name='tour-create'), 
    
    path('provider/customers/', ProviderCustomerListView.as_view(), name='provider-customers'),
    path('provider/tours/<int:tour_id>/update-status/', UpdateTourStatusView.as_view(), name='update-tour-status'),
    path('provider/revenue-report/', ProviderRevenueReportView.as_view(), name='provider-revenue-report'),
]
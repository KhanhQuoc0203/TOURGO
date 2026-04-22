from django.urls import path
from .views import TourCreateView, TourDetailAPIView, TourFilterView, TourImageUploadView, BookingView

urlpatterns = [
    # 1. Trang danh sách và Tạo
    path('', TourCreateView.as_view(), name='tour-create'), 
    # 2. Lọc Tour
    path('filter/', TourFilterView.as_view(), name='tour-filter'),
    # 3. Chi tiết Tour
    path('<int:pk>/', TourDetailAPIView.as_view(), name='tour-detail'),
    # 4. Upload ảnh cho Tour (Nhiệm vụ Khang)
    path('<int:tour_id>/upload-images/', TourImageUploadView.as_view(), name='tour-upload-images'),
    # 5. Đặt Tour (Nhiệm vụ Tân)
    path('book/', BookingView.as_view(), name='tour-book'),
]
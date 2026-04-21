from django.urls import path
from .views import TourCreateView, TourDetailAPIView, TourFilterView

urlpatterns = [
    # 1. Trang danh sách và Tạo (Nhiệm vụ của Tân/Khang)
    path('', TourCreateView.as_view(), name='tour-create'), 
    # 2. Lọc Tour (Nhiệm vụ của Khang - Đưa lên trước PK)
    path('filter/', TourFilterView.as_view(), name='tour-filter'),
    # 3. Chi tiết Tour (Nhiệm vụ của Khánh)
    path('<int:pk>/', TourDetailAPIView.as_view(), name='tour-detail'),
]
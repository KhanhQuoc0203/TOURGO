from rest_framework import generics, filters, permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Tour, TourImage
from .serializers import TourSerializer, TourImageSerializer
from .permissions import IsAdminOrProvider
import logging

logger = logging.getLogger('app_logger')

# CHỈ DÙNG MỘT CLASS NÀY CHO CẢ XEM DANH SÁCH VÀ TẠO TOUR
class TourCreateView(generics.ListCreateAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrProvider()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Tour.objects.all()
        
        query = self.request.query_params.get('search')
        min_p = self.request.query_params.get('min_price')
        max_p = self.request.query_params.get('max_price')
        
        # THÊM CODE: React gửi 'start_date', nhưng Backend đang dùng 'departure_date'
        d_date = self.request.query_params.get('departure_date')
        s_date = self.request.query_params.get('start_date') # Thêm dòng này

        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(address__icontains=query))
        if min_p:
            queryset = queryset.filter(price__gte=min_p)
        if max_p:
            queryset = queryset.filter(price__lte=max_p)
            
        # THÊM CODE: Kiểm tra cả 2 tên biến để không bị sót
        if d_date:
            queryset = queryset.filter(departure_date=d_date)
        if s_date: # Thêm dòng này
            queryset = queryset.filter(departure_date=s_date)
            
        return queryset
    def perform_create(self, serializer):
        # Tự động gán người tạo cho tour mới
        serializer.save(creator=self.request.user)

# GIỮ NGUYÊN API LỌC NÂNG CAO CỦA KHANG
class TourFilterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('search')
        min_p = request.query_params.get('min_price')
        max_p = request.query_params.get('max_price')
        d_date = request.query_params.get('departure_date')

        tours = Tour.objects.all()

        if query:
            tours = tours.filter(Q(title__icontains=query) | Q(address__icontains=query))
        
        # Thêm xử lý ép kiểu số để tránh lỗi 500
        if min_p: tours = tours.filter(price__gte=min_p)
        if max_p: tours = tours.filter(price__lte=max_p)
        if d_date: tours = tours.filter(departure_date=d_date)

        serializer = TourSerializer(tours, many=True, context={'request': request})
        return Response(serializer.data)

# GIỮ NGUYÊN CHI TIẾT VÀ BOOKING
class TourDetailAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request, pk):
        try:
            tour = Tour.objects.get(pk=pk)
            return Response(TourSerializer(tour, context={'request': request}).data)
        except Tour.DoesNotExist:
            return Response({"error": "Không tìm thấy!"}, status=404)

class BookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        tour_id = request.data.get('tour_id')
        try:
            tour = Tour.objects.get(id=tour_id)
            if tour.slots <= 0:
                logger.error(f"Đặt tour lỗi: Tour '{tour.title}' đã hết chỗ.")
                return Response({"error": "Tour đã hết chỗ!"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Giả lập đặt tour thành công
            return Response({"message": "Đặt tour thành công!"}, status=status.HTTP_201_CREATED)
        except Tour.DoesNotExist:
            logger.error(f"Đặt tour lỗi: Không tìm thấy Tour ID {tour_id}")
            return Response({"error": "Không tìm thấy tour!"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Lỗi hệ thống khi đặt tour")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TourImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, tour_id):
        try:
            tour = Tour.objects.get(id=tour_id)
            # Cho phép người tạo hoặc admin upload
            if tour.creator != request.user and not request.user.is_staff:
                return Response({"error": "Bạn không có quyền upload ảnh cho tour này"}, status=status.HTTP_403_FORBIDDEN)
            
            files = request.FILES.getlist('images')
            uploaded_images = []
            for f in files:
                img = TourImage.objects.create(tour=tour, image=f)
                uploaded_images.append(TourImageSerializer(img).data)
            
            return Response({
                "message": f"Đã upload thành công {len(uploaded_images)} ảnh.",
                "images": uploaded_images
            }, status=status.HTTP_201_CREATED)
        except Tour.DoesNotExist:
            return Response({"error": "Không tìm thấy tour!"}, status=status.HTTP_404_NOT_FOUND)


class LocationListView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        # Trả về danh sách tỉnh thành (kèm tọa độ trung tâm để dùng cho map)
        provinces = [
            {"id": 1, "name": "Hà Nội", "lat": 21.0285, "lng": 105.8542},
            {"id": 2, "name": "Hồ Chí Minh", "lat": 10.8231, "lng": 106.6297},
            {"id": 3, "name": "Đà Nẵng", "lat": 16.0471, "lng": 108.2068},
            {"id": 4, "name": "Nha Trang", "lat": 12.2388, "lng": 109.1967},
            {"id": 5, "name": "Đà Lạt", "lat": 11.9404, "lng": 108.4583},
            {"id": 6, "name": "Phú Quốc", "lat": 10.2899, "lng": 103.9840},
        ]
        return Response(provinces)
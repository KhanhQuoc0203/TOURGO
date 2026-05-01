from rest_framework import generics, filters, permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Tour, TourImage, Booking
from .serializers import BookingSerializer, TourSerializer, TourImageSerializer
from .permissions import IsAdminOrProvider
import logging
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import date
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
logger = logging.getLogger('app_logger')

@method_decorator(csrf_exempt, name='dispatch')
class BookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1. Lấy dữ liệu từ Frontend
        tour_id = request.data.get('tour')
        num_people = request.data.get('number_of_people')

        if not tour_id or not num_people:
            return Response(
                {"error": "Thiếu thông tin tour hoặc số lượng người!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 2. Lấy thông tin tour từ Database
            tour = Tour.objects.get(id=tour_id)
            
            # Ép kiểu số người sang số nguyên
            try:
                num_people = int(num_people)
            except (ValueError, TypeError):
                return Response({"error": "Số lượng người không hợp lệ!"}, status=400)

            # --- 3. LOGIC VALIDATION CỦA TÂN: Kiểm tra ngày khởi hành ---
            # Ngăn chặn đặt tour nếu ngày khởi hành đã qua hoặc là ngày hôm nay
            if tour.departure_date <= date.today():
                logger.warning(f"User {request.user} định đặt tour đã quá hạn: {tour.title}")
                return Response(
                    {"error": f"Không thể đặt tour này. Ngày khởi hành ({tour.departure_date}) phải sau ngày hiện tại!"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # --- 4. LOGIC VALIDATION CỦA HÀ: Kiểm tra số chỗ trống ---
            if tour.slots <= 0:
                return Response({"error": "Tour này hiện đã hết sạch chỗ!"}, status=status.HTTP_400_BAD_REQUEST)

            if num_people > tour.slots:
                return Response(
                    {"number_of_people": [f"Tour này chỉ còn {tour.slots} chỗ trống!"]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # --- 5. LƯU DỮ LIỆU VÀ CẬP NHẬT DATABASE ---
            serializer = BookingSerializer(data=request.data)
            if serializer.is_valid():
                # Lưu thông tin người đặt
                serializer.save(user=request.user) 
                
                # Trừ số chỗ còn trống trực tiếp vào bảng Tour
                tour.slots -= num_people
                tour.save()

                logger.info(f"Đặt tour thành công: User {request.user} - Tour {tour.title}")
                return Response(
                    {"message": "Đặt tour thành công!", "remaining_slots": tour.slots}, 
                    status=status.HTTP_201_CREATED
                )
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Tour.DoesNotExist:
            return Response({"error": "Không tìm thấy tour này trong hệ thống!"}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.exception("Lỗi hệ thống khi đặt tour")
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
    
    
from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer

class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] # Bắt buộc đăng nhập tại IUH

    def perform_create(self, serializer):
        serializer.save()
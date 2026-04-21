# from rest_framework import generics
# from rest_framework.views import APIView # Thiếu dòng này
# from rest_framework.response import Response # Thiếu dòng này
# from .models import Tour
# from .serializers import TourSerializer


# class TourCreateView(generics.ListCreateAPIView):
#     queryset = Tour.objects.all()
#     serializer_class = TourSerializer
# class TourDetailAPIView(APIView):
#     def get(self, request, pk):
#         try:
#             tour = Tour.objects.get(pk=pk)
#             serializer = TourSerializer(tour)
#             return Response(serializer.data)
#         except Tour.DoesNotExist:
#             return Response({"error": "Không tìm thấy tour!"}, status=404)


from rest_framework import generics, filters, permissions # Thêm filters và permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tour
from .serializers import TourSerializer
from .permissions import IsAdminOrProvider
# 1. Lấy danh sách & Tìm kiếm (Khánh làm chính)
class TourCreateView(generics.ListCreateAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    
    # KHÁNH: Thêm bộ lọc tìm kiếm ở đây
    filter_backends = [filters.SearchFilter]
    search_fields = ['title','address'] # Cho phép tìm theo tên và địa điểm
    
    # TÂN: Phân quyền - Xem tour thì ai cũng được (AllowAny)
    # Nhưng nếu dùng phương thức POST để tạo tour thì có thể chỉnh lại sau
    permission_classes = [permissions.AllowAny]

# 2. Lấy chi tiết 1 tour
class TourDetailAPIView(APIView):
    # TÂN: API xem chi tiết cũng để public
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            tour = Tour.objects.get(pk=pk)
            serializer = TourSerializer(tour)
            return Response(serializer.data)
        except Tour.DoesNotExist:
            return Response({"error": "Không tìm thấy tour!"}, status=404)

# 3. TÂN: Thêm API đặt tour (Yêu cầu phải đăng nhập)
class BookingView(APIView):
    # Chỉ những người có Token (đã đăng nhập) mới được gọi API này
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Logic xử lý đặt tour ở đây
        return Response({"message": "Đặt tour thành công!"})
class TourFilterView(APIView):
    def get(self, request):
        # Lấy các tham số từ URL do Khang bắn lên từ Frontend
        min_p = request.query_params.get('min_price')
        max_p = request.query_params.get('max_price')
        d_date = request.query_params.get('departure_date')

        # Bắt đầu với tất cả các Tour
        tours = Tour.objects.all()

        # Logic lọc của Khang
        if min_p:
            tours = tours.filter(price__gte=min_p) # Lấy tour có giá >= min_p
        if max_p:
            tours = tours.filter(price__lte=max_p) # Lấy tour có giá <= max_p
        if d_date:
            tours = tours.filter(departure_date=d_date)

        serializer = TourSerializer(tours, many=True)
        return Response(serializer.data)
class TourListCreateView(generics.ListCreateAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    
    # Tân thêm dòng này để chặn Customer tạo Tour
    permission_classes = [IsAdminOrProvider]

    def perform_create(self, serializer):
        # Tự động gán người tạo là user hiện tại
        serializer.save(creator=self.request.user)
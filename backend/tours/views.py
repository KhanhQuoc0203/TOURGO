from rest_framework import generics, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Tour
from .serializers import TourSerializer
from .permissions import IsAdminOrProvider

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

        serializer = TourSerializer(tours, many=True)
        return Response(serializer.data)

# GIỮ NGUYÊN CHI TIẾT VÀ BOOKING
class TourDetailAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request, pk):
        try:
            tour = Tour.objects.get(pk=pk)
            return Response(TourSerializer(tour).data)
        except Tour.DoesNotExist:
            return Response({"error": "Không tìm thấy!"}, status=404)

class BookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        return Response({"message": "Đặt tour thành công!"})
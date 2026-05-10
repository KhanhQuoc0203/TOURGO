from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Tour, TourImage, Booking, Transaction, Payment, Revenue
from .serializers import BookingSerializer, TourSerializer, TourImageSerializer, BookingDetailSerializer
from .permissions import IsAdminOrProvider
import logging
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import date
logger = logging.getLogger('app_logger')
from django.conf import settings
from .email_service import send_ticket_email

# Thêm vào imports hiện có của tours/views.py day 16
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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
            if tour.departure_date and tour.departure_date <= date.today():
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
            # Truyền context={'request': request} để serializer lấy được user đang đăng nhập
            serializer = BookingSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                # Serializer.save() đã bao gồm logic trừ slots và tính total_price
                booking = serializer.save() 

                logger.info(f"Dat tour thanh cong: User {request.user} - Tour {tour.title}")
                return Response(
                    {"message": "Đặt tour thành công!", "id": booking.id}, 
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

# --- THÊM VIEW CHO NGÀY 13 (TÂN & KHÁNH) ---

class UserBookingListView(generics.ListAPIView):
    """
    API lấy danh sách đơn hàng của chính người dùng đang đăng nhập
    """
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Chỉ trả về các đơn hàng của user hiện tại, sắp xếp mới nhất lên đầu
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

class BookingDetailView(APIView):
    """
    API xem chi tiết và Hủy đơn hàng
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
            serializer = BookingDetailSerializer(booking, context={'request': request})
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng!"}, status=404)

    def patch(self, request, pk):
        """
        Logic Hủy đơn hàng: Chuyển trạng thái sang 'cancelled' và hoàn trả slots cho Tour
        """
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
            
            if booking.status == 'cancelled':
                return Response({"error": "Đơn hàng này đã được hủy trước đó rồi!"}, status=400)

            # Cập nhật trạng thái đơn hàng
            booking.status = 'cancelled'
            booking.save()

            # Hoàn trả lại số lượng chỗ (slots) cho Tour
            tour = booking.tour
            tour.slots += booking.number_of_people
            tour.save()

            logger.info(f"Hủy đơn hàng thành công: User {request.user} - Booking ID {pk}")
            return Response({"message": "Hủy đơn hàng thành công!", "status": "cancelled"})
            
        except Booking.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng để hủy!"}, status=404)
        


import datetime


class VietQRCreateView(APIView):
    """
    API Tạo mã VietQR - Ngày 15 (Khang)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng"}, status=404)

        # 1. Tạo Transaction mới (Trạng thái Pending)
        txn_ref = datetime.datetime.now().strftime('%Y%m%d%H%M%S') + str(booking.id)
        Transaction.objects.create(
            booking=booking,
            vnp_txn_ref=txn_ref,
            amount=booking.total_price
        )

        # 2. Tạo link VietQR (Sử dụng VietQR.io)
        # Định dạng: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
        bank_id = settings.VIETQR_BANK_ID
        account_no = settings.VIETQR_ACCOUNT_NO
        account_name = settings.VIETQR_ACCOUNT_NAME
        amount = int(booking.total_price)
        content = f"TOURGO{booking.id}" # Nội dung chuyển khoản

        qr_url = f"https://img.vietqr.io/image/{bank_id}-{account_no}-qr_only.png?amount={amount}&addInfo={content}&accountName={account_name}"

        return Response({
            "qr_url": qr_url,
            "bank_id": bank_id,
            "account_no": account_no,
            "account_name": account_name,
            "amount": amount,
            "content": content
        }, status=200)


class BookingConfirmPaymentView(APIView):
    """
    API để khách hàng thông báo đã chuyển khoản VietQR - Ngày 15 (Tân)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
            booking.status = 'confirmed'
            booking.save()
            send_ticket_email(booking)
            return Response({"message": "Thông báo thành công, vui lòng chờ Admin duyệt"}, status=200)
        except Booking.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng"}, status=404)

class AdminBookingListView(APIView):
    """
    API Admin: Danh sách tất cả đơn hàng - Ngày 16 (Khang)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({"error": "Bạn không có quyền truy cập"}, status=403)
        
        bookings = Booking.objects.all().order_by('-created_at')
        from .serializers import BookingSerializer # Import local để tránh circular import nếu có
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class AdminApproveBookingView(APIView):
    """
    API Admin: Duyệt thanh toán cho đơn hàng VietQR - Ngày 16 (Khang)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({"error": "Bạn không có quyền thực hiện"}, status=403)
        
        try:
            booking = Booking.objects.get(id=pk)
            booking.status = 'confirmed'
            booking.save()
            
            # (Tùy chọn) Có thể tạo bản ghi Payment và Revenue ở đây giống VNPay Callback
            
            return Response({"message": f"Đã duyệt đơn hàng {pk} thành công!"})
        except Booking.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng"}, status=404)


# backend/tours/views.py — thêm vào cuối file

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, booking_id):
    """
    API Polling: Kiểm tra trạng thái thanh toán theo thời gian thực.
    
    Frontend gọi API này mỗi 3-5 giây để cập nhật UI.
    
    GET /api/bookings/<booking_id>/payment-status/
    
    Response:
    {
        "booking_id": 42,
        "booking_code": "TG000042",
        "booking_status": "confirmed",
        "payment_status": "SUCCESS",
        "payment_method": "VNPay",
        "amount": 5000000,
        "amount_display": "5.000.000 VNĐ",
        "paid_at": "2025-01-16T10:30:00Z",
        "is_paid": true,
        "poll_again": false       ← Frontend dựa vào field này để biết có cần poll tiếp không
    }
    """
    try:
        # Lấy booking — chỉ cho phép xem booking của chính mình
        booking = Booking.objects.select_related('tour', 'user').get(
            id=booking_id,
            user=request.user
        )
    except Booking.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy đơn hàng."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Lấy payment mới nhất liên quan đến booking
    payment = None
    payment_status_value = "PENDING"
    payment_method = None
    amount = None
    paid_at = None

    try:
        payment = booking.payments.order_by('-created_at').first()
        if payment:
            payment_status_value = getattr(payment, 'status', 'PENDING')
            payment_method = getattr(payment, 'payment_method', None)
            amount = getattr(payment, 'amount', None)
            paid_at = getattr(payment, 'updated_at', None) or getattr(payment, 'created_at', None)
    except Exception:
        pass

    # Map payment method sang tên hiển thị
    method_map = {
        'vnpay': 'VNPay',
        'momo': 'MoMo',
        'cash': 'Tiền mặt',
        'bank_transfer': 'Chuyển khoản',
        'credit_card': 'Thẻ tín dụng',
    }
    payment_method_display = method_map.get(
        (payment_method or '').lower(), payment_method or 'Online'
    )

    # Xác định trạng thái tổng thể
    is_paid = (
        payment_status_value in ['SUCCESS', 'success', 'COMPLETED', 'completed']
        or booking.status in ['confirmed', 'paid', 'Đã thanh toán']
    )

    # poll_again = True nghĩa là frontend nên tiếp tục gọi API
    # Dừng poll khi đã paid, failed, hoặc cancelled
    terminal_statuses = [
        'SUCCESS', 'success', 'COMPLETED', 'completed',
        'FAILED', 'failed', 'CANCELLED', 'cancelled',
        'confirmed', 'paid', 'Đã thanh toán', 'cancelled'
    ]
    poll_again = (
        payment_status_value not in terminal_statuses
        and booking.status not in terminal_statuses
    )

    # Format số tiền
    def fmt_currency(val):
        try:
            return f"{int(val):,} VNĐ".replace(",", ".")
        except (ValueError, TypeError):
            return f"{val} VNĐ" if val else "N/A"

    return Response({
        "booking_id": booking.id,
        "booking_code": f"TG{booking.id:06d}",
        "booking_status": booking.status,
        "payment_status": payment_status_value,
        "payment_method": payment_method_display,
        "amount": amount,
        "amount_display": fmt_currency(amount or getattr(booking, 'total_price', None)),
        "tour_name": booking.tour.title,
        "paid_at": paid_at,
        "is_paid": is_paid,
        "poll_again": poll_again,
        "checked_at": timezone.now(),   # Timestamp để debug
    })
from rest_framework import status, generics
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PasswordResetOTP, User
from django.core.mail import send_mail
import logging
import random

logger = logging.getLogger('app_logger')

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Đăng ký thành công!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            logger.info(f"Người dùng {username} đã đăng nhập thành công.")
            return Response({
                "message": "Đăng nhập thành công!",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "username": user.username,
                "role": user.role
            }, status=status.HTTP_200_OK)
            
        logger.warning(f"Thử đăng nhập thất bại cho tài khoản: {username}")
        return Response({"error": "Sai tài khoản hoặc mật khẩu"}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    """
    API yêu cầu gửi mã OTP qua Email để quên mật khẩu
    """
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Kiểm tra user tồn tại
            if not User.objects.filter(email=email).exists():
                return Response({"error": "Không tìm thấy người dùng với email này"}, status=status.HTTP_404_NOT_FOUND)
            
            # Tạo mã OTP 6 chữ số
            otp_code = str(random.randint(100000, 999999))
            
            # Xóa mã OTP cũ (nếu có) và tạo mã mới để reset thời gian 5 phút
            PasswordResetOTP.objects.filter(email=email).delete()
            PasswordResetOTP.objects.create(email=email, otp=otp_code)

            # Gửi Email
            subject = 'Mã OTP đặt lại mật khẩu của bạn'
            message = f'Mã OTP của bạn là: {otp_code}. Mã này có hiệu lực trong 5 phút.'
            email_from = None # Sẽ lấy từ settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            try:
                send_mail(subject, message, email_from, recipient_list)
                return Response({"message": "Mã OTP đã được gửi về email của bạn!"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": f"Lỗi gửi mail: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    """
    API xác thực mã OTP gửi qua Email
    """
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            try:
                otp_obj = PasswordResetOTP.objects.filter(email=email, otp=otp).latest('created_at')
                
                if otp_obj.is_expired():
                    return Response({"error": "Mã OTP đã hết hạn"}, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({"message": "Mã OTP chính xác!"}, status=status.HTTP_200_OK)
            except PasswordResetOTP.DoesNotExist:
                return Response({"error": "Mã OTP không đúng"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """
    API đặt lại mật khẩu mới sau khi đã xác thực OTP
    """
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            try:
                # Kiểm tra lại OTP lần nữa cho chắc chắn
                otp_obj = PasswordResetOTP.objects.filter(email=email, otp=otp).latest('created_at')
                
                if otp_obj.is_expired():
                    return Response({"error": "Mã OTP đã hết hạn"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Cập nhật mật khẩu
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                
                # Xóa OTP sau khi dùng xong
                PasswordResetOTP.objects.filter(email=email).delete()
                
                return Response({"message": "Đặt lại mật khẩu thành công!"}, status=status.HTTP_200_OK)
                
            except PasswordResetOTP.DoesNotExist:
                return Response({"error": "Xác thực không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

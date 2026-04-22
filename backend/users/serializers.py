from rest_framework import serializers
from .models import User
import re

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone', 'role')

    def validate_password(self, value):
        # Validate mật khẩu yếu (ít nhất 8 ký tự, có 1 chữ cái và 1 số)
        if len(value) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        if not re.search(r"[A-Za-z]", value) or not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Mật khẩu phải bao gồm cả chữ và số.")
        return value

    def create(self, validated_data):
        # Mã hóa mật khẩu trước khi lưu
        user = User.objects.create_user(**validated_data)
        return user

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

#XAT THUC OTP
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'is_staff')

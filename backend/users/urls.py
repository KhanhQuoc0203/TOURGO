from django.urls import path
# Import tất cả các class view trực tiếp
from .views import (
    ChangePasswordView, RegisterView, LoginView, UpdateProfileView,
    VerifyOTPView, ResetPasswordView, ForgotPasswordView,
    AdminUserListView, AdminSystemStatsView,ToggleUserStatusView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/system-stats/', AdminSystemStatsView.as_view(), name='admin-system-stats'),
    path('admin/users/<int:user_id>/toggle-status/', ToggleUserStatusView.as_view(), name='toggle-user-status'),
]
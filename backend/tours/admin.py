from django.contrib import admin
from .models import Tour, TourImage, Booking

class TourImageInline(admin.TabularInline):
    model = TourImage
    extra = 1

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'slots', 'creator', 'created_at')
    list_filter = ('created_at', 'creator')
    search_fields = ('title', 'description')
    inlines = [TourImageInline]

@admin.register(TourImage)
class TourImageAdmin(admin.ModelAdmin):
    list_display = ('tour', 'image', 'created_at')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tour', 'number_of_people', 'total_price', 'status', 'created_at')
    list_editable = ('status',) # Cho phép sửa trạng thái ngay tại danh sách
    list_filter = ('status', 'booking_date')
    search_fields = ('user__username', 'tour__title')
    actions = ['approve_payment']

    @admin.action(description='Xác nhận đã thanh toán các đơn chọn')
    def approve_payment(self, request, queryset):
        queryset.update(status='paid')
        self.message_user(request, "Đã duyệt thanh toán thành công!")
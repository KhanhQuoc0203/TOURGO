from django.contrib import admin
from .models import Tour, TourImage

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

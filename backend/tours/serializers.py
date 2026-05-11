from rest_framework import serializers
from .models import Booking, Tour, TourImage
from datetime import date
class TourImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ['id', 'image', 'created_at']

class TourSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.username')
    creator_phone = serializers.ReadOnlyField(source='creator.phone')
    tour_images = TourImageSerializer(many=True, read_only=True)

    class Meta:
        model = Tour
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        # Chặn mọi tác động từ Frontend vào các trường này
        read_only_fields = ['user', 'total_price', 'status']

    def validate(self, data):
        tour = data['tour']
        # Chỉ cần kiểm tra xem tour còn chỗ không (1 đơn = 1 chỗ)
        if tour.slots <= 0:
            raise serializers.ValidationError("Tour này đã hết lượt đặt (slots)!")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        tour = validated_data['tour']
        
        # 1. ÉP GIÁ TRỌN GÓI: Lấy trực tiếp từ tour, kệ Frontend gửi gì
        fixed_total_price = tour.price
        
        # 2. TRỪ SLOT: Mỗi đơn hàng trừ đúng 1 slot (không theo số người)
        tour.slots -= 1 
        tour.save()

        # 3. LƯU BOOKING:
        # Lấy tour và num_people ra khỏi validated_data để tránh lỗi trùng tham số khi dùng **
        # Nếu không pop, khi gọi Booking.objects.create(tour=tour, **validated_data) sẽ bị lỗi "truyền tour 2 lần"
        validated_data.pop('user', None) # Đảm bảo không bị trùng
        validated_data.pop('total_price', None) # Đảm bảo không bị trùng

        booking = Booking.objects.create(
            user=user,
            total_price=fixed_total_price, # Gán giá cố định tại đây
            **validated_data
        )
        return booking

# --- THÊM SERIALIZER CHO NGÀY 13 (TÂN) ---
class BookingDetailSerializer(serializers.ModelSerializer):
    tour_details = TourSerializer(source='tour', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'status']

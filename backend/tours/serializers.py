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

from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        # Chặn mọi tác động từ Frontend vào các trường hệ thống tự tính
        read_only_fields = ['user', 'total_price', 'status', 'booking_date']

    def validate(self, data):
        tour = data.get('tour')
        num_people = data.get('number_of_people')
        
        # Lấy ngày từ dữ liệu thô gửi lên để kiểm tra
        input_date = self.initial_data.get('booking_date') 

        # 1. TÁCH LỖI NGÀY KHỞI HÀNH
        if input_date and str(input_date) != str(tour.departure_date):
            raise serializers.ValidationError({
                "date_error": f"Ngày khởi hành không hợp lệ! Tour này cố định ngày {tour.departure_date}."
            })

        # 2. TÁCH LỖI SỐ LƯỢNG NGƯỜI
        if num_people is not None:
            if num_people < 1 or num_people > 100:
                raise serializers.ValidationError({
                    "people_error": "Số lượng người đặt phải nằm trong khoảng từ 1 đến 100 người."
                })

        # 3. TÁCH LỖI HẾT LƯỢT ĐẶT (SLOTS)
        if tour and tour.slots <= 0:
            raise serializers.ValidationError({
                "slot_error": "Xin lỗi, tour này hiện đã hết lượt đặt!"
            })
            
        return data

    def create(self, validated_data):
        # Lấy thông tin từ context và tour
        user = self.context['request'].user
        tour = validated_data['tour']
        
        # NGHIỆP VỤ 1: Trừ slot trực tiếp vào model Tour
        tour.slots -= 1 
        tour.save()

        # NGHIỆP VỤ 2: Ép dữ liệu hệ thống (Backend làm chủ)
        validated_data['user'] = user
        validated_data['total_price'] = tour.price
        validated_data['booking_date'] = tour.departure_date

        # NGHIỆP VỤ 3: Lưu vào DB và RETURN BOOKING (Quan trọng)
        # Sử dụng super().create để Django xử lý việc lưu và trả về instance vừa tạo
        booking = super().create(validated_data)
        
        return booking

# --- THÊM SERIALIZER CHO NGÀY 13 (TÂN) ---
class BookingDetailSerializer(serializers.ModelSerializer):
    tour_details = TourSerializer(source='tour', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'status']

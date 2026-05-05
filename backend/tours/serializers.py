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
        read_only_fields = ['user', 'total_price', 'status']

    def validate(self, data):
        tour = data['tour']
        num_people = data['number_of_people']
        if num_people > tour.slots:
            raise serializers.ValidationError(f"Tour này không còn chỗ trống!")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        tour = validated_data['tour']
        num_people = validated_data['number_of_people']

        total_price = tour.price * num_people
        
        tour.slots -= num_people
        tour.save()

        # 4. Lưu Booking với đầy đủ thông tin
        booking = Booking.objects.create(
            user=user,
            total_price=total_price,
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

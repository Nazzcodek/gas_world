from rest_framework import serializers
from station_attendant.models import Attendant
from station.models import Station
from django.contrib.auth.hashers import make_password
from owner.serializers import TokenObtainPairSerializer


class AttendantSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating attendant details.
    """

    class Meta:
        model = Attendant
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'country'
            ]
        read_only_fields = ['id']


class AttendantCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new attendant.
    """
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
        )

    class Meta:
        model = Attendant
        fields = [
            'name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'country',
            'password'
            ]

    def create(self, validated_data):
        """
        Create a new attendant and set their password.
        """
        request = self.context['request']
        station_id = request.parser_context['kwargs']['station_id']
        station = Station.objects.get(id=station_id)
        validated_data['password'] = make_password(validated_data['password'])
        attendant = Attendant.objects.create(station=station, **validated_data)

        return attendant


class AttendantTokenObtainPairSerializer(TokenObtainPairSerializer):
    model = Attendant

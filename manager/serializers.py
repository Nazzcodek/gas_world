from rest_framework import serializers
from manager.models import Manager
from station.models import Station
from django.contrib.auth.hashers import make_password
from owner.serializers import TokenObtainPairSerializer


class ManagerSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating Manager details.
    """
    class Meta:
        model = Manager
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


class ManagerCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Manager.
    """
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
        )

    class Meta:
        model = Manager
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
        Create a new Manager,
        set their password,
        and update the Station's manager field.
        """
        request = self.context['request']
        station_id = request.parser_context['kwargs']['station_id']
        station = Station.objects.get(id=station_id)
        validated_data['password'] = make_password(validated_data['password'])
        manager = Manager.objects.create(station=station, **validated_data)

        # Update the station's manager field
        station.manager = manager
        station.save()

        return manager

    def update(self, instance, validated_data):
        """
        Update a Manager, hash the new password if it's being updated.
        """
        # Check if the password is being updated
        if 'password' in validated_data:
            hash_password = make_password(validated_data['password'])
            validated_data['password'] = hash_password

        # Update the manager
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class ManagerTokenObtainPairSerializer(TokenObtainPairSerializer):
    model = Manager
